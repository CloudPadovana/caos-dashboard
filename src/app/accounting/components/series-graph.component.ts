import { Component, OnChanges, AfterViewInit, Input, ViewChild } from '@angular/core';
import { ApiService, Project, Metric, Sample, DateRange } from '../../api.service';

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
export class SeriesGraphComponent implements AfterViewInit, OnChanges {
  @Input() project: Project;
  @Input() metric: Metric;
  @Input() period: number;
  @Input() daterange: DateRange;

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  ngOnChanges() {
    this.update_samples();
  }

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
      margin: {
        top: 20,
        right: 50,
        bottom: 50,
        left: 50
      },
      x: function(d: Sample) { return d.timestamp; },
      y: function(d: Sample) { return d.value/3600; },
      useInteractiveGuideline: true,
      interpolate: 'step',
      xAxis: {
        // axisLabel: 'Date',
        tickFormat: function(d: any) {
          return d3.time.format('%a %d')(new Date(d));
        },
      },
      xScale: d3.time.scale(),
      yAxis: {
        // axisLabel: 'Usage [hours]',
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
