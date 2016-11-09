import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import moment from 'moment';

import { ApiService, Project, Metric, DateRange, Aggregate } from '../api.service';

export { Project, Metric, DateRange, Aggregate };
export type Granularity = number;

export interface PresetDuration {
  label: string;
  duration: moment.MomentInput;
}

export interface ProjectAggregate {
  project: Project;
  values: Aggregate[];
}

export interface Data {
  aggregates: ProjectAggregate[];
  overall: ProjectAggregate;
}

@Injectable()
export class AccountingService {
  readonly period = 3600;

  constructor(private _api: ApiService) {
    this._api.projects().subscribe(
      (projects: Project[]) => {
        this.projects = projects;
      });
  }

  private _projects = new BehaviorSubject<Project[]>([]);
  projects$ = this._projects.asObservable();
  set projects(p: Project[]) {
    this._projects.next(p);
    this.update_data();
  }
  get projects(): Project[] {
    return this._projects.value;
  }

  private _metric = new BehaviorSubject<Metric>(undefined);
  metric$ = this._metric.asObservable();
  set metric(m: Metric) {
    this._metric.next(m);
    this.update_data();
  }
  get metric(): Metric {
    return this._metric.value;
  }

  private _daterange = new BehaviorSubject<DateRange>(undefined);
  daterange$ = this._daterange.asObservable();
  set daterange(d: DateRange) {
    this._daterange.next(d);
    this.update_data();
  }
  get daterange(): DateRange {
    return this._daterange.value;
  }

  private _granularity = new BehaviorSubject<Granularity>(undefined);
  granularity$ = this._granularity.asObservable();
  set granularity(g: Granularity) {
    this._granularity.next(g);
    this.update_data();
  }
  get granularity(): Granularity {
    return this._granularity.value;
  }

  private _data = new BehaviorSubject<Data>(undefined);
  data$ = this._data.asObservable();
  set data(d: Data) {
    this._data.next(d);
  }
  get data(): Data {
    return this._data.value;
  }

  private _fetching_data = new BehaviorSubject<number>(undefined);
  fetching_data$ = this._fetching_data.asObservable();
  set fetching_data(percent: number) {
    this._fetching_data.next(percent);
  }
  get fetching_data(): number {
    return this._fetching_data.value;
  }

  private update_data() {
    if (!this.projects) { return };
    if (!this.metric) { return };
    if (!this.daterange) { return };
    if (!this.granularity) { return };

    this.fetching_data = 0;

    // +1 for the overall aggregate data
    let increment: number = 1/(1+this.projects.length);

    this.fetch_data(increment)
      .subscribe((aggregates: ProjectAggregate[]) => {
        this.fetch_aggregate_data(increment)
          .subscribe((overall: ProjectAggregate) => {
            this.fetching_data = undefined;
            this.data = <Data>({
              aggregates: aggregates,
              overall: overall
            });
          })
      });
  }

  private fetch_data(inc: number): Observable<ProjectAggregate[]> {
    let obs: Array< Observable<ProjectAggregate> > = [];
    let req: Observable<Aggregate[]>;

    for (let p of this.projects) {
      req = this._api.aggregate_for_one_project(p, this.period,
                                                this.metric,
                                                this.daterange,
                                                this.granularity);
      obs.push(req.map(
        (a: Aggregate[]) => {
          this.fetching_data += inc;

          return <ProjectAggregate>({
            project: p,
            values: a
          });
        }));
    }

    return Observable.forkJoin(obs);
  }

  private fetch_aggregate_data(inc: number): Observable<ProjectAggregate> {
    let req = this._api.aggregate_for_all_projects(this.period,
                                                   this.metric,
                                                   this.daterange,
                                                   this.granularity);

    return req.map((a: Aggregate[]) => {
      this.fetching_data += inc;
      return <ProjectAggregate>({
        project: <Project>({name: "OVERALL"}),
        values: a
      });
    });
  }
}
