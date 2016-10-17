import { Component, AfterViewInit, OnChanges, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import { ApiService, Project, Metric, Aggregate, DateRange } from '../api.service';
import { OVERALL_PROJECT } from './project-selector.component';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';
import moment from 'moment';

interface AggregateMap {
  [id: string] : Aggregate[]
}

interface TableRow {
  from: Date;
  to: Date;
  sum: { [id: string] : number };
}

@Component({
  selector: 'aggregate-graph',
  templateUrl: 'components/aggregate-graph.component.html'
})
export class AggregateGraphComponent implements AfterViewInit, OnChanges {
  @Input() projects: Project[];
  @Input() metric: Metric;
  @Input() period: number;
  @Input() daterange: DateRange;
  @Input() granularity: number;
  @Input() show_table: boolean = false;

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  ngOnChanges() {
    if (!this.projects) { return };
    if (!this.metric) { return };
    if (!this.period) { return };
    if (!this.daterange) { return };
    if (!this.granularity) { return };

    this._values = {};
    this._values_sum = {};
    this.data = [];

    this.fetch_samples().subscribe(() => {
      this.process_values();

      setTimeout(() => {
        this.update_chart();
      }, 50);
    });
  }

  private update_chart(): void {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    if (this.daterange) {
      let d1 = moment(this.daterange.start);
      let dt = moment(this.daterange.end).diff(d1, 'days');
      let fmt = "";
      if (dt > 90) {
        fmt = '%b %d';
      } else if (dt > 7) {
        fmt = '%b %d';
      } else {
        fmt = '%b %d';
      }

      this.nvD3.chart.xAxis.tickFormat(function(d: any) {
        return d3.time.format(fmt)(new Date(d));})
    }

    this.nvD3.chart.update();
  }

  private _values: AggregateMap = {};
  private _values_sum: { [id: string] : number } = {};
  private values_sum(id: string): number {
    return this._values_sum[id];
  };

  private table_values: TableRow[] = [];
  private compute_tabular_data() {
    this.table_values = [];

    let ts: Date[] = [];

    for (let k in this._values) {
      this._values[k].map((a: Aggregate) => {
        if (!ts.find((d: Date) => moment(d).isSame(a.timestamp))) {
          ts.push(new Date(a.timestamp));
        }
      });
    }

    let sorted_ts = ts.sort(
      (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

    for (let t of sorted_ts) {
      let to: Date = t;
      let from: Date = moment(t).subtract(this.granularity, 'second').toDate();
      let sum: { [id: string] : number } = {};

      for (let k in this._values) {
        sum[k] = this._values[k]
          .filter((a: Aggregate) => moment(a.timestamp).isSame(t))
          .map((a: Aggregate) => a.sum)
          .reduce((acc, cur) => acc + cur, 0);
      }

      let row = <TableRow>({
        from: from,
        to: to,
        sum: sum});
      this.table_values.push(row);
    }
  }

  private fetch_samples(): Observable<void[]> {
    let obs: Array< Observable<void> > = [];

    for (let p of this.projects) {
      if (p == OVERALL_PROJECT) {
        obs.push(this._api.aggregate_for_all_projects(this.period, this.metric, this.daterange, this.granularity)
                 .map((a: Aggregate[]) => {
                 this._values[p.id] = a; }));
      } else {
        obs.push(this._api.aggregate_for_one_project(p, this.period, this.metric, this.daterange, this.granularity)
                 .map((a: Aggregate[]) => {
                   this._values[p.id] = a; }));
      }
    }

    return Observable.forkJoin(obs);
  }

  private process_values() {
    for (let p of this.projects) {
      this._values_sum[p.id] = this._values[p.id].map((a: Aggregate) => a.sum).reduce((acc, cur) => acc + cur, 0);
      this.compute_tabular_data();

      this.data.push({
        values: this._values[p.id],
        key: p.name
      });
    }
  }

  ngAfterViewInit() {
    this.update_chart();
  }

  data: any[] = [];
  options = {
    chart: {
      type: 'lineChart',
      showLegend: true,
      height: 250,
      margin: {
        top: 20,
        right: 50,
        bottom: 50,
        left: 50
      },
      x: function(d: Aggregate) { return d.timestamp; },
      y: function(d: Aggregate) { return d.sum/3600; },
      useInteractiveGuideline: true,
      interpolate: 'step',
      xAxis: {
        axisLabel: 'Date',
      },
      xScale: d3.time.scale(),
      yAxis: {
        axisLabel: 'hours',
        tickFormat: function(d: any) {
          return d3.format('.02s')(d);
        },
        axisLabelDistance: -10
      },
      interactiveLayer: {
        tooltip: {
          valueFormatter: function(d: any) {
            return d3.format('.02s')(d) + ' hours';
          },
          headerFormatter: function (d: any) {
            return d3.time.format("%a %b %d %H:%M %Y")(new Date(d));
          }
        }
      }
    }
  };
}
