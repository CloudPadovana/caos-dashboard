import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { ApiService, Project, Period, Sample } from './api.service';
import { DateRange } from './range.component';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';

@Component({
  selector: 'series-graph',
  templateUrl: 'series-graph.component.html'
})
export class SeriesGraphComponent implements AfterViewInit {
  @Input() metric: string;
  @Input() title: string = "";

  _project: Project;
  @Input()
  set project(p: Project) {
    this._project = p;
    this.update_samples();
  }

  get project(): Project {
    return this._project;
  }

  _period: Period;
  @Input()
  set period(p: Period) {
    this._period = p;
    this.update_samples();
  }

  get period(): Period {
    return this._period;
  }

  _range: DateRange;
  @Input()
  set range(r: DateRange) {
    this._range = r;
    this.update_chart();
  }

  get range(): DateRange {
    return this._range;
  }

  tableCollapsed: boolean = true;
  samples: Sample[];
  in_range_samples(): Sample[] {
    if (!this.samples) { return [] };
    return this.samples.filter((s: Sample) => (s.timestamp >= this.range.start) && (s.timestamp <= this.range.end))
  }

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  private update_chart(): void {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    if (this.range) {
      this.nvD3.chart.brushExtent([this.range.start, this.range.end]);
    }

    this.nvD3.chart.update();
  }

  private update_samples(): void {
    if (!this.project) { return };
    if (!this.period) { return };

    this._api.samples(this.project, this.period, this.metric)
      .subscribe((s: Sample[]) => {
        this.samples = s;
        this.data = [{
          values: s,
          key: this.metric
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
      type: 'lineWithFocusChart',
      showLegend: false,
      height: 250,
      margin: {
        top: 20,
        right: 50,
        bottom: 50,
        left: 50
      },
      x: function(d: Sample) { return d.timestamp; },
      y: function(d: Sample) { return d.value/3600; },
      useInteractiveGuideline: true,
      dispatch: {
        // stateChange: function(e: any){ console.log("stateChange"); },
        // changeState: function(e: any){ console.log("changeState"); },
        // tooltipShow: function(e: any){ console.log("tooltipShow"); },
        // tooltipHide: function(e: any){ console.log("tooltipHide"); }
      },
      interpolate: 'step',
      xAxis: {
        axisLabel: 'Time',
        tickFormat: function(d: any) {
          return d3.time.format('%b %d %H:%M')(new Date(d));
        },
      },
      x2Axis: {
        tickFormat: function(d: any) {
          return d3.time.format('%b %d')(new Date(d));
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
      callback: function(chart: any) { }
    }
  };
}
