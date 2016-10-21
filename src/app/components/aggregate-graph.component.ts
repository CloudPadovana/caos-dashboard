import { Component, OnInit, AfterViewInit, OnChanges, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import { ApiService, Project, Metric, Aggregate, DateRange } from '../api.service';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';
import moment from 'moment';

interface DataSeries {
  values: Aggregate[];
  key: string;
  disabled: boolean;
}

const OVERALL_PROJECT: Project = <Project>({
  id: "__OVERALL",
  name: "OVERALL"
});

@Component({
  selector: 'aggregate-graph',
  templateUrl: 'components/aggregate-graph.component.html'
})
export class AggregateGraphComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() metric: Metric;
  @Input() period: number;
  @Input() daterange: DateRange;
  @Input() granularity: number;

  loading: number = -1;
  projects: Project[];
  _dataseries_map: { [id: string] : number } = {};

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  ngOnInit() {
    this._api.projects().subscribe(
      (projects: Project[]) => {
        this.projects = [OVERALL_PROJECT].concat(projects.sort((p1: Project, p2: Project) => {
          if (p1.name < p2.name) {
            return -1;
          } else if (p1.name > p2.name) {
            return 1;
          } else {
            return 0;
          }
        }));

        // At this point there are no dataseries
        for (let p of this.projects) {
          this.data.push({
            values: [],
            key: p.name,
            disabled: true,
          });
          this._dataseries_map[p.id] = this.data.length-1;
        }

        this.update();
      });
  }

  private dataseries(p: Project): DataSeries {
    return this.data[this._dataseries_map[p.id]];
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
    this.fetch_samples().subscribe(() => {
      setTimeout(() => {
        this.update_chart();
        this.loading = -1;
      }, 50);
    });
  }

  private update_chart(): void {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    this.nvD3.chart.update();
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
        this.dataseries(p).values = a;
        if (a.length == 0) {
          this.dataseries(p).disabled = true;
        } else {
          this.dataseries(p).disabled = false;
        }

        let sum = a.map((a: Aggregate) => a.sum).reduce((acc, cur) => acc + cur, 0);
        this._dataseries_sum[p.id] = sum;
        this.loading += 1/this.projects.length;
      }));
    }
    return Observable.forkJoin(obs);
  }

  private _dataseries_sum: { [id: string] : number } = {};
  private dataseries_sum(p: Project): number {
    return this._dataseries_sum[p.id];
  };

  private data_to_CSV(): string {
    let s: string[] = [];

    let row: string[] = [];
    row.push("From");
    row.push("To");
    this.projects.map((p: Project) => row.push(p.name));
    s.push(row.join());

    let ts: Date[] = [];

    for (let series of this.data) {
      series.values.map((a: Aggregate) => {
        if (!ts.find((d: Date) => moment(d).isSame(a.timestamp))) {
          ts.push(new Date(a.timestamp));
        }
      });
    }

    let sorted_ts = ts.sort(
      (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

    for (let t of sorted_ts) {
      row = [];
      row.push(moment(t).subtract(this.granularity, 'second').toString());
      row.push(moment(t).toString());

      for (let p of this.projects) {
        let tmp = this.dataseries(p).values.find((a: Aggregate) => moment(t).isSame(a.timestamp));
        if (tmp) {
          row.push((tmp.sum/3600).toString());
        } else {
          row.push("NaN");
        }
      }
      s.push(row.join());
    }

    row = [];
    row.push(moment(this.daterange.start).toString());
    row.push(moment(this.daterange.end).toString());
    for (let p of this.projects) {
      row.push((this.dataseries_sum(p)/3600).toString());
    }
    s.push(row.join());
    return s.join('\n');
  }

  download_CSV(filename: string) {
    let data = this.data_to_CSV();

    let blob = new Blob([data], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);

    a.href = url;
    a.download = filename;

    a.click();
  }

  ngAfterViewInit() {
    this.update_chart();
  }

  data: DataSeries[] = [];
  options = {
    chart: {
      type: 'lineChart',
      height: 350,
      margin: {
        top: 20,
        right: 50,
        bottom: 150,
        left: 50
      },
      x: function(d: Aggregate) { return d.timestamp; },
      y: function(d: Aggregate) { return d.sum/3600; },
      interpolate: 'step',
      xAxis: {
        axisLabel: 'Date',
        tickFormat: function(d: any) {
          return d3.time.format("%b %d")(new Date(d));
        }
      },
      xScale: d3.time.scale(),
      yAxis: {
        axisLabel: 'hours',
        tickFormat: function(d: any) {
          return d3.format('.02s')(d);
        },
        axisLabelDistance: -10
      },
      showLegend: true,
      legendPosition: 'bottom',
      legend: {
        height: 150,
        margin: {
          top: 20,
          right: 20,
          left: 20,
          bottom: 20
        }
      },
      useInteractiveGuideline: false,
      interactive: true,
      tooltip: {
        valueFormatter: function(d: any) {
          return d3.format('.02s')(d) + ' hours';
        },
        headerFormatter: function (d: any) {
          return d3.time.format("%a %b %d %H:%M %Y")(new Date(d));
        }
      }
    }
  };
}
