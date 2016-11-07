import { Component, AfterContentInit, OnChanges, Input, ContentChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import { ApiService, Project, Metric, Aggregate, DateRange } from '../../api.service';

import { AggregateDownloadComponent } from './aggregate-download.component';
import { AggregateGraphComponent } from './aggregate-graph.component';
import { AggregateTableComponent } from './aggregate-table.component';

export interface AggregateData {
  project: Project;
  values: Aggregate[];
};

const OVERALL_PROJECT: Project = <Project>({
  id: "__OVERALL",
  name: "OVERALL"
});

@Component({
  selector: 'aggregate',
  template: `
<div *ngIf="loading>=0">
  <div class="row">
    <div class="col-sm-2"></div>
    <div class="col-sm-8">Loading data: {{ loading | percent }}
      <progress class="progress" [value]="loading" max="1"></progress>
    </div>
  </div>
</div>
<div *ngIf="loading<0">
  <ng-content></ng-content>
</div>
`
})
export class AggregateComponent implements AfterContentInit, OnChanges {
  @Input() metric: Metric;
  @Input() period: number;
  @Input() daterange: DateRange;
  @Input() granularity: number;

  loading: number = -1;
  projects: Project[];

  data: AggregateData[] = [];

  @ContentChild(AggregateDownloadComponent) download: AggregateDownloadComponent;
  @ContentChild(AggregateGraphComponent) graph: AggregateGraphComponent;
  @ContentChild(AggregateTableComponent) table: AggregateTableComponent;

  constructor(private _api: ApiService) {}

  ngAfterContentInit() {
    this._api.projects().subscribe(
      (projects: Project[]) => {
        this.projects = [OVERALL_PROJECT].concat(projects);

        this.update();
      });
  }

  ngOnChanges() {
    this.update();
  }

  private update() {
    if (!this.projects) { return };
    if (!this.metric) { return };
    if (!this.period) { return };
    if (!this.daterange) { return };
    if (!this.granularity) { return };

    this.loading = 0;
    this.data = [];
    this.fetch_samples().subscribe(() => {
      if(this.graph) {
        this.graph.update(this.data);
      }

      if(this.table) {
        this.table.update(this.data);
      }

      if(this.download) {
        this.download.update(this.data, this.projects, this.daterange, this.granularity);
      }

      this.loading = -1;
    });
  }

  private fetch_samples(): Observable<void[]> {
    let obs: Array< Observable<void> > = [];

    for (let p of this.projects) {
      let req: Observable<Aggregate[]>;

      if (p == OVERALL_PROJECT) {
        req = this._api.aggregate_for_all_projects(this.period, this.metric, this.daterange, this.granularity);
      } else {
        req = this._api.aggregate_for_one_project(p, this.period, this.metric, this.daterange, this.granularity);
      }

      obs.push(req.map((a: Aggregate[]) => {
        this.data.push(<AggregateData>({
          project: p,
          values: a
        }));

        this.loading += 1/this.projects.length;
      }));
    }
    return Observable.forkJoin(obs);
  }
}
