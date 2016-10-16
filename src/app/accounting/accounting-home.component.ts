import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment';

import { ApiService, Project, Metric, DateRange, Aggregate } from '../api.service';

import { GraphType } from '../components/aggregate-graph.component';

@Component({
  templateUrl: 'accounting/accounting-home.component.html'
})
export class AccountingHomeComponent implements OnInit {
  metric: Metric;
  projects: Project[];
  daterange: DateRange;

  private _duration = {days: 7};
  sorted_projects: Project[] = [];
  gridded_projects: Array<Project[]> = [];

  aggregates: { [id: string] : Aggregate } = {};

  private GraphTypes = GraphType;

  constructor(private _api: ApiService) { }

  ngOnInit() {
    let now = moment.utc();
    let end_date = now.toDate();
    let duration = moment.duration(this._duration);
    let start_date = now.subtract(duration).toDate();

    this.daterange = <DateRange>({
      start: start_date,
      end: end_date
    });
  }

  metric_selected(m: Metric) {
    this.metric = m;

    this._api.projects().subscribe(
      (projects: Project[]) => {
        this.projects = projects;
        this._api.aggregate(this.projects, 3600, this.metric, this.daterange, moment.duration(this._duration).asSeconds())
          .subscribe((a: { [id: string] : Aggregate[] }) => {
            this.sort_projects(a);
            this.grid_projects(this.sorted_projects);
          });
      });
  }

  private sort_projects(aggregate: { [id: string] : Aggregate[] }) {
    this.sorted_projects = [];

    let tmp: Array<[Aggregate, string]> = [];
    for(let a in aggregate){
      tmp.push([aggregate[a][0], a]);
    }

    tmp
      .sort((a1: [Aggregate, string], a2: [Aggregate, string]) => -(a1[0].sum - a2[0].sum ))
      .map((a: [Aggregate, string]) => {
        let p = this.projects.find((p: Project) => p.id == a[1]);
        this.aggregates[p.id] = a[0];
        this.sorted_projects.push(p);
      });
  }

  private grid_projects(sorted_projects: Project[]) {
    let rows: number[] = [];
    for(let i=0; i<sorted_projects.length/3; i++) {
      rows.push(i);
    }

    this.gridded_projects = [];
    for(let row of rows) {
      this.gridded_projects.push(this.sorted_projects.slice(3*row,3*row+3));
    }
  }

}
