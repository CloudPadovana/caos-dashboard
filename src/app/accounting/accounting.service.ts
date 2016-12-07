////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2016 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
//
////////////////////////////////////////////////////////////////////////////////

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/zip';

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
  aggregate: Aggregate;
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
        this.projects = projects.sort((p1: Project, p2: Project) => {
          if (p1.name > p2.name) { return +1; }
          if (p1.name < p2.name) { return -1; }
          return 0;
        });
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

    // PDCL-642: workaround waiting the efficiency metric to be implemented in the collector
    if(this.metric.name === 'efficiency') {
      this.fetch_data_pdcl_642(increment)
        .subscribe((aggregates: ProjectAggregate[]) => {
          this.fetch_aggregate_data_pdcl_642(increment)
            .subscribe((overall: ProjectAggregate) => {
              this.fetching_data = undefined;
              this.data = <Data>({
                aggregates: aggregates,
                overall: overall
              });
            })
        });
      return;
    }

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
    let req_aggregate: Observable<Aggregate[]>;
    let granularity = moment(this.daterange.end).unix() - moment(this.daterange.start).unix();

    for (let p of this.projects) {
      req = this._api.aggregate_for_one_project(p, this.period,
                                                this.metric,
                                                this.daterange,
                                                this.granularity);

      req_aggregate = this._api.aggregate_for_one_project(p, this.period,
                                                          this.metric,
                                                          this.daterange,
                                                          granularity);

      obs.push(Observable.zip(req, req_aggregate).map(
        (AA: Array<Aggregate[]>) => {
          this.fetching_data += inc;

          return <ProjectAggregate>({
            project: p,
            values: AA[0],
            aggregate: AA[1][0] || <Aggregate>({})
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

    let granularity = moment(this.daterange.end).unix() - moment(this.daterange.start).unix();
    let req_aggregate = this._api.aggregate_for_all_projects(this.period,
                                                             this.metric,
                                                             this.daterange,
                                                             granularity);

    return Observable.zip(req, req_aggregate)
      .map((AA: Array<Aggregate[]>) => {
        this.fetching_data += inc;
        return <ProjectAggregate>({
          project: <Project>({name: "OVERALL"}),
          values: AA[0],
          aggregate: AA[1][0]
        });
      });
  }

  // PDCL-642: workaround waiting the efficiency metric to be implemented in the collector
  private fetch_data_pdcl_642(inc: number): Observable<ProjectAggregate[]> {
    let obs: Array< Observable<ProjectAggregate> > = [];
    let req: Observable<Aggregate[]>;
    let req_aggregate: Observable<Aggregate[]>;

    let req_cpu: Observable<Aggregate[]>;
    let req_wall: Observable<Aggregate[]>;
    let granularity = moment(this.daterange.end).unix() - moment(this.daterange.start).unix();
    let req_cpu_aggregate: Observable<Aggregate[]>;
    let req_wall_aggregate: Observable<Aggregate[]>;
    for (let p of this.projects) {
      req_cpu = this._api.aggregate_for_one_project(p, this.period,
                                                    <Metric>({name: 'cpu'}),
                                                    this.daterange,
                                                    this.granularity);
      req_wall = this._api.aggregate_for_one_project(p, this.period,
                                                     <Metric>({name: 'wallclocktime'}),
                                                     this.daterange,
                                                     this.granularity);

      req_cpu_aggregate = this._api.aggregate_for_one_project(p, this.period,
                                                              <Metric>({name: 'cpu'}),
                                                              this.daterange,
                                                              granularity);
      req_wall_aggregate = this._api.aggregate_for_one_project(p, this.period,
                                                               <Metric>({name: 'wallclocktime'}),
                                                               this.daterange,
                                                               granularity);

      req = Observable.zip(req_cpu, req_wall)
        .map((AA: Array<Aggregate[]>) => {
          let a1 = AA[0];
          let a2 = AA[1];

          let ts = a1.map((a: Aggregate) => a.timestamp).sort(
            (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

          let A: Aggregate[] = [];
          for (let a of a1) {
            let v2 = a2.find((atmp: Aggregate) => moment(a.timestamp).isSame(atmp.timestamp));
            if(v2) {
              a.sum = a.sum / v2.sum;
              A.push(a);
            }
          }
          return A;
        });

      req_aggregate = Observable.zip(req_cpu_aggregate, req_wall_aggregate)
        .map((AA: Array<Aggregate[]>) => {
          let a1 = AA[0];
          let a2 = AA[1];

          let ts = a1.map((a: Aggregate) => a.timestamp).sort(
            (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

          let A: Aggregate[] = [];
          for (let a of a1) {
            let v2 = a2.find((atmp: Aggregate) => moment(a.timestamp).isSame(atmp.timestamp));
            if(v2) {
              a.sum = a.sum / v2.sum;
              A.push(a);
            }
          }
          return A;
        });

      obs.push(Observable.zip(req, req_aggregate).map(
        (AA: Array<Aggregate[]>) => {
          this.fetching_data += inc;

          return <ProjectAggregate>({
            project: p,
            values: AA[0],
            aggregate: AA[1][0] || <Aggregate>({})
          });
        }));
    }

    return Observable.forkJoin(obs);
  }

  // PDCL-642: workaround waiting the efficiency metric to be implemented in the collector
  private fetch_aggregate_data_pdcl_642(inc: number): Observable<ProjectAggregate> {
    let req_cpu = this._api.aggregate_for_all_projects(this.period,
                                                       <Metric>({name: 'cpu'}),
                                                       this.daterange,
                                                       this.granularity);

    let req_wall = this._api.aggregate_for_all_projects(this.period,
                                                        <Metric>({name: 'wallclocktime'}),
                                                        this.daterange,
                                                        this.granularity);
    let granularity = moment(this.daterange.end).unix() - moment(this.daterange.start).unix();
    let req_cpu_aggregate = this._api.aggregate_for_all_projects(this.period,
                                                                 <Metric>({name: 'cpu'}),
                                                                 this.daterange,
                                                                 granularity);

    let req_wall_aggregate = this._api.aggregate_for_all_projects(this.period,
                                                                  <Metric>({name: 'wallclocktime'}),
                                                                  this.daterange,
                                                                  granularity);

    let req = Observable.zip(req_cpu, req_wall)
      .map((AA: Array<Aggregate[]>) => {
        let a1 = AA[0];
        let a2 = AA[1];

        let ts = a1.map((a: Aggregate) => a.timestamp).sort(
          (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

        let A: Aggregate[] = [];
        for (let a of a1) {
          let v2 = a2.find((atmp: Aggregate) => moment(a.timestamp).isSame(atmp.timestamp));
          if(v2) {
            a.sum = a.sum / v2.sum;
            A.push(a);
          }
        }

        return A
      });

    let req_aggregate = Observable.zip(req_cpu_aggregate, req_wall_aggregate)
      .map((AA: Array<Aggregate[]>) => {
        let a1 = AA[0];
        let a2 = AA[1];

        let ts = a1.map((a: Aggregate) => a.timestamp).sort(
          (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

        let A: Aggregate[] = [];
        for (let a of a1) {
          let v2 = a2.find((atmp: Aggregate) => moment(a.timestamp).isSame(atmp.timestamp));
          if(v2) {
            a.sum = a.sum / v2.sum;
            A.push(a);
          }
        }

        return A;
      });

    return Observable.zip(req, req_aggregate)
      .map((AA: Array<Aggregate[]>) => {
        this.fetching_data += inc;
        return <ProjectAggregate>({
          project: <Project>({name: "OVERALL"}),
          values: AA[0],
          aggregate: AA[1][0]
        });
      });
  }
}
