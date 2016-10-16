import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

import * as d3 from 'd3';
import moment from 'moment';

import { SETTINGS } from './settings';

export interface Project {
  id: string;
  name: string;
}

export interface Metric {
  name: string;
  type: string;
}

export interface Series {
  id: number;
  metric: string;
  period: number;
  project_id: string;
  last_timestamp: string;
  ttl: number;
}

export interface Sample {
  timestamp: Date;
  value: number;
  start_date: Date;
  end_date: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Aggregate {
  timestamp: Date;
  avg: number;
  count: number;
  min: number;
  max: number;
  std: number;
  variance: number;
  sum: number;
  from: Date;
  to: Date;
  granularity: number;
}

const DATE_FORMAT = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");

@Injectable()
export class ApiService {
  private _projects: Project[];
  private _projects_observable: Observable<Project[]>;

  private _metrics: Metric[];
  private _metrics_observable: Observable<Metric[]>;

  constructor(private _http: Http) { }

  projects(): Observable<Project[]> {
    if (this._projects) {
      // if `this._projects` is available just return it as an
      // `Observable`
      return Observable.of(this._projects);
    } else if (this._projects_observable) {
      // if `this._projects_observable` is set then the request is in
      // progress return the `Observable` for the ongoing request
      return this._projects_observable;
    } else {
      // create the request, store the `Observable` for subsequent subscribers
      this._projects_observable = this._http.get(`${SETTINGS.CAOS_API_URL}/projects`)
        .map((r: Response) => {
          // when the cached data is available we don't need the `Observable` reference anymore
          this._projects_observable = null;
          this._projects = this.parse_projects(r.json().data);
          return this._projects;})
        .share() // make it shared so more than one subscriber can get the result
        .catch(this.handle_error);
      return this._projects_observable;
    }
  }

  project(id: string): Observable<Project> {
    return this._http.get(`${SETTINGS.CAOS_API_URL}/projects/${id}`)
      .map((r: Response) => this.parse_project(r.json().data))
      .catch(this.handle_error);
  }

  private parse_projects(data: any): Project[] {
    return data.map(this.parse_project);
  }

  private parse_project(data: any): Project {
    return <Project>({
      id: data.id,
      name: data.name
    });
  }

  metrics(): Observable<Metric[]> {
    if (this._metrics) {
      return Observable.of(this._metrics);
    } else if (this._metrics_observable) {
      return this._metrics_observable;
    } else {
      this._metrics_observable = this._http.get(`${SETTINGS.CAOS_API_URL}/metrics`)
        .map((r: Response) => {
          this._metrics_observable = null;
          this._metrics = this.parse_metrics(r.json().data);
          return this._metrics;})
        .share()
        .catch(this.handle_error);
      return this._metrics_observable;
    }
  }

  private parse_metrics(data: any): Metric[] {
    return data.map(this.parse_metric);
  }

  private parse_metric(data: any): Metric {
    return <Metric>({
      name: data.name,
      type: data.type
    });
  }

  private series(project: Project, period: number, metric: Metric): Observable<Series[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('project_id', project.id);
    params.set('period', period.toString());
    params.set('metric_name', metric.name);

    return this._http.get(`${SETTINGS.CAOS_API_URL}/series`, { search: params })
      .map((r: Response) => this.parse_series(r.json().data))
      .catch(this.handle_error);
  }

  private parse_series(data: any): Series[] {
    return data.map(this.parse_one_series);
  }

  private parse_one_series(data: any): Series {
    return <Series>({
      id: Number(data.id),
      project_id: data.project_id,
      metric: data.metric_name,
      period: Number(data.period),
      ttl: Number(data.ttl),
      last_timestamp: data.last_timestamp
    });
  }

  samples(project: Project, period: number, metric: Metric, daterange: DateRange): Observable<Sample[]> {
    let series = this.series(project, period, metric);

    let params: URLSearchParams = new URLSearchParams();
    params.set('from', DATE_FORMAT(daterange.start));
    params.set('to', DATE_FORMAT(daterange.end));

    return series.flatMap(
      (s: Series[]) => {
        let id = s[0].id;
        return this._http.get(`${SETTINGS.CAOS_API_URL}/series/${id}/samples`, { search: params })
          .map((r: Response) => this.parse_samples(r, period))
          .catch(this.handle_error);
      });
  }

  private parse_samples(response: Response, period: number): Sample[] {
    return response.json().data.map((d: any) => this.parse_sample(d, period));
  }

  private parse_sample(data: any, period: number): Sample {
    let end_date = DATE_FORMAT.parse(data.timestamp);
    let start_date = moment(end_date).subtract(period, 'seconds').toDate();

    let sample = <Sample>({
      timestamp: end_date,
      value: Number(data.value),
      start_date: start_date,
      end_date: end_date
    });
    return sample;
  }


  private _aggregate(projects: Project[], period: number, metric: Metric, daterange: DateRange, granularity: number): Observable<Response> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('metric', metric.name);
    params.set('period', `${period}`);
    params.set('from', DATE_FORMAT(daterange.start));
    params.set('to', DATE_FORMAT(daterange.end));
    for(let p of projects) {
      params.append('projects[]', p.id);
    }
    params.set('granularity', `${granularity}`);

    let query = this._http.get(`${SETTINGS.CAOS_API_URL}/aggregate`, { search: params });
    return query;
  }

  aggregate_for_one_project(project: Project, period: number, metric: Metric, daterange: DateRange, granularity: number): Observable<Aggregate[]> {
    return this._aggregate([project], period, metric, daterange, granularity)
      .map((r: Response) => this.parse_aggregate_for_one_project(r.json().data, project.id))
      .catch(this.handle_error);
  }

  aggregate_for_all_projects(period: number, metric: Metric, daterange: DateRange, granularity: number): Observable<Aggregate[]> {
    return this._aggregate([], period, metric, daterange, granularity)
      .map((r: Response) => this.parse_aggregate_for_all_projects(r.json().data))
      .catch(this.handle_error);
  }

  aggregate(projects: Project[], period: number, metric: Metric, daterange: DateRange, granularity: number): Observable<{ [id: string] : Aggregate[] }> {
    return this._aggregate(projects, period, metric, daterange, granularity)
      .map((r: Response) => this.parse_aggregates(r.json().data))
      .catch(this.handle_error);
  }

  private parse_aggregates(data: any): { [id: string] : Aggregate[] } {
    let ret: { [id: string] : Aggregate[] } = {};
    for(let k in data) {
      ret[k] = data[k].map((d: any) => this.parse_one_aggregate(d));
    }
    return ret;
  }

  private parse_aggregate_for_one_project(data: any, id: string): Aggregate[] {
    if (!data[id]) {
      return [];
    }

    return data[id].map((d: any) => this.parse_one_aggregate(d));
  }

  private parse_aggregate_for_all_projects(data: any): Aggregate[] {
    return data.map((d: any) => this.parse_one_aggregate(d));
  }

  private parse_one_aggregate(data: any): Aggregate {
    return <Aggregate>({
      timestamp: DATE_FORMAT.parse(data.timestamp),
      from: DATE_FORMAT.parse(data.from),
      to: DATE_FORMAT.parse(data.to),
      granularity: data.granularity,
      avg: data.avg,
      count: data.count,
      min: data.min,
      max: data.max,
      std: data.std,
      variance: data.var,
      sum: data.sum,
    });
  }

  private handle_error(error: any) {
    if(error instanceof Response) {
      return Observable.throw(error.json().error || 'backend server error');
    }
    let msg = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    return Observable.throw(msg);
  }
}
