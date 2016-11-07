import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Aggregate, ProjectAggregate } from '../accounting.service';

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
export class AggregateGraphComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(nvD3) nvD3: nvD3;
  data: GraphSeries[] = [];

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.data$
      .subscribe(
        (pas: ProjectAggregate[]) => this.update(pas));
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  update(data: ProjectAggregate[]) {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    let tmp = data
      .map((a: ProjectAggregate) => <GraphSeries>({
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
