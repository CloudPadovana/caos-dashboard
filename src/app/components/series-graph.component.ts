import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { ApiService, Project, Metric, Sample, DateRange } from '../api.service';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';

@Component({
  selector: 'series-graph',
  template: `
<div>
  <nvd3 [options]="options" [data]="data"></nvd3>
</div>
`
})
export class SeriesGraphComponent implements AfterViewInit {
  _project: Project;
  @Input()
  set project(p: Project) {
    this._project = p;
    this.update_samples();
  }

  get project(): Project {
    return this._project;
  }

  _metric: Metric;
  @Input()
  set metric(m: Metric) {
    this._metric = m;
    this.update_samples();
  }

  get metric(): Metric {
    return this._metric;
  }

  _period: number;
  @Input()
  set period(p: number) {
    this._period = p;
    this.update_samples();
  }

  get period(): number {
    return this._period;
  }

  _daterange: DateRange;
  @Input()
  set daterange(r: DateRange) {
    this._daterange = r;
    this.update_samples();
  }

  get daterange(): DateRange {
    return this._daterange;
  }

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  private update_chart(): void {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    this.nvD3.chart.update();
  }

  private update_samples(): void {
    if (!this.project) { return };
    if (!this.metric) { return };
    if (!this.period) { return };
    if (!this.daterange) { return };

    this._api.samples(this.project, this.period, this.metric, this.daterange)
      .subscribe((s: Sample[]) => {
        this.data = [{
          values: s,
          key: this.project.name
        }];
        setTimeout(() => {
          this.update_chart();
        }, 50);
      });
    }

  ngAfterViewInit() {
    this.update_chart();
  }

  data: any[] = [];
  options = {
    chart: {
      type: 'lineChart',
      showLegend: false,
      height: 250,
      x: function(d: Sample) { return d.timestamp; },
      y: function(d: Sample) { return d.value/3600; },
      useInteractiveGuideline: true,
      interpolate: 'step',
      xAxis: {
        axisLabel: 'Date',
        tickFormat: function(d: any) {
          return d3.time.format('%d %b %H:%M')(new Date(d));
        },
      },
      xScale: d3.time.scale(),
      yAxis: {
        axisLabel: 'Usage [hours]',
        tickFormat: function(d: any) {
          return d3.format('.02f')(d);
        },
        axisLabelDistance: -10
      },
    }
  };
}
