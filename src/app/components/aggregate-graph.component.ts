import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { ApiService, Project, Metric, Aggregate, DateRange } from '../api.service';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';

@Component({
  selector: 'aggregate-graph',
  template: `
<div>
  <nvd3 [options]="options" [data]="data"></nvd3>
</div>
`
})
export class AggregateGraphComponent implements AfterViewInit {
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

  _granularity: number;
  @Input()
  set granularity(g: number) {
    this._granularity = g;
    this.update_samples();
  }

  get granularity(): number {
    return this._granularity;
  }

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  private update_chart(): void {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    if (this.daterange) {
      this.nvD3.chart.brushExtent([this.daterange.start, this.daterange.end]);
    }

    this.nvD3.chart.update();
    // console.log("chart", this.nvD3.chart.focus.dispatch);
    // this.nvD3.chart.focus.dispatch.on('brush', function(extent:any, brush:any){ console.log("brush",extent, brush); });
    // this.nvD3.chart.focus.dispatch.on('onBrush', function(e:any){ console.log("onBrush",e); });
    // this.nvD3.chart.focus.dispatch.on('renderEnd', function(e:any){ console.log("renderend",e); });

  }

  private update_samples(): void {
    if (!this.project) { return };
    if (!this.metric) { return };
    if (!this.period) { return };
    if (!this.daterange) { return };
    if (!this.granularity) { return };

    this._api.aggregate_for_one_project(this.project, this.period, this.metric, this.daterange, this.granularity)
      .subscribe((a: Aggregate[]) => {
        this.data = [{
          values: a,
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
      // lines: {
      //   dispatch: {
      //     elementClick: function(e: any){ console.log("elementClick"); },
      //   }
      // },
      // // focus: {
      // //   dispatch: {
      // //     onBrush: function(e: any){ console.log("brush"); },
      // //     renderEnd: function(e: any){ console.log("renderEnd"); },
      // //   }
      // // },

      type: 'lineWithFocusChart',
      showLegend: false,
      height: 250,
      x: function(d: Aggregate) { return d.timestamp; },
      y: function(d: Aggregate) { return d.sum/3600; },
      useInteractiveGuideline: true,
      interpolate: 'step',
      xAxis: {
        axisLabel: 'Date',
        tickFormat: function(d: any) {
          return d3.time.format('%d %b %H:%M')(new Date(d));
        },
      },
      xScale: d3.time.scale(),
      x2Axis: {
        tickFormat: function(d: any) {
          return d3.time.format('%b %d')(new Date(d));
        },
      },
      yAxis: {
        axisLabel: 'Usage [hours]',
        tickFormat: function(d: any) {
          return d3.format('.02f')(d);
        },
        axisLabelDistance: -10
      }
    }
  };
}
