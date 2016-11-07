import { Component, OnInit, AfterViewInit, OnChanges, Input, ViewChild } from '@angular/core';

import { Aggregate } from '../../api.service';
import { AggregateData } from './aggregate.component';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';

interface GraphSeries {
  values: Aggregate[];
  key: string;
  disabled: boolean;
}

@Component({
  selector: 'aggregate-graph',
  template: `<nvd3 [options]="options" [data]="data"></nvd3>`
})
export class AggregateGraphComponent implements AfterViewInit {
  @ViewChild(nvD3) nvD3: nvD3;

  constructor() {}

  update(data: AggregateData[]) {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    let tmp = data
      .map((a: AggregateData) => <GraphSeries>({
        values: a.values,
        key: a.project.name,
        disabled: (a.values.length < 1)
      }));

    this.data = tmp;

    // Without this timeout, the chart is not correctly setup
    setTimeout(() => {
      this.nvD3.chart.update();
    }, 50);
  }

  ngAfterViewInit() {
    this.update([]);
  }

  data: GraphSeries[] = [];
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
          return d3.format('.05s')(d) + ' hours';
        },
        headerFormatter: function (d: any) {
          return d3.time.format("%a %b %d %H:%M %Y %Z")(new Date(d));
        }
      }
    }
  };
}
