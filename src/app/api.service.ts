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

export interface Period {
  name: string;
  value: number;
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

const PERIODS: Period[] = [
  { name: "hourly", value: 3600},
  { name: "daily", value: 86400},
];

const DATE_FORMAT = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");

@Injectable()
export class ApiService {
  private _projects: Project[];
  private _projects_observable: Observable<Project[]>;

  constructor(private _http: Http) { }

  periods(): Period[] {
    return PERIODS;
  }

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
          this._projects = this.parse_projects(r);
          return this._projects;})
        .share() // make it shared so more than one subscriber can get the result
        .catch(this.handle_error);
      return this._projects_observable;
    }
  }

  private series(project: Project, period: Period, metric: string): Observable<Series[]> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('project_id', project.id);
    params.set('period', period.value.toString());
    params.set('metric_name', metric);

    return this._http.get(`${SETTINGS.CAOS_API_URL}/series`, { search: params })
      .map((r: Response) => this.parse_series(r))
      .catch(this.handle_error);
  }

  private parse_series(response: Response): Series[] {
    return response.json().data.map(this.parse_one_series);
  }

  private parse_one_series(data: any): Series {
    let series = <Series>({
      id: Number(data.id),
      project_id: data.project_id,
      metric: data.metric_name,
      period: Number(data.period),
      ttl: Number(data.ttl),
      last_timestamp: data.last_timestamp
    });
    return series;
  }

  samples(project: Project, period: Period, metric: string): Observable<Sample[]> {
    let series = this.series(project, period, metric);

    return series.flatMap(
      (s: Series[]) => {
        let id = s[0].id;
        return this._http.get(`${SETTINGS.CAOS_API_URL}/series/${id}/samples`)
          .map((r: Response) => this.parse_samples(r, period.value))
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

  private parse_projects(response: Response): Project[] {
    return response.json().data.map(this.parse_project);
  }

  private parse_project(data: any): Project {
    return <Project>({
      id: data.id,
      name: data.name
    });
  }

  private handle_error(err: any) {
    console.log('error:', err);  // debug
    if(err instanceof Response) {
      //return Observable.throw(err.json().error || 'backend server error');
      // if you're using lite-server, use the following line
      // instead of the line above:
      //return Observable.throw(err.text() || 'backend server error');
    }
    //return Observable.throw(err || 'backend server error');
    //let errMsg = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    //console.log(error);
    return Observable.throw("errMsg");
  }
}
