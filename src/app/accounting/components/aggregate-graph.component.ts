import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Project, Aggregate, ProjectAggregate, Data } from '../accounting.service';

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
  template: `
<nvd3 [options]="options" [data]="data"></nvd3>

<p>Double click on legend bullet to select only one project.</p>
`
})
export class AggregateGraphComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(nvD3) nvD3: nvD3;
  data: GraphSeries[];

  _subscriptions: Subscription[];
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscriptions = [];

    this._subscriptions.push(this._accounting.projects$.subscribe((projects: Project[]) => {
      this.data = [];
      this.data.push(<GraphSeries>({
        values: [],
        key: "",
        disabled: false
      }));

      for(let p of projects) {
        this.data.push(<GraphSeries>({
          values: [],
          key: p.name,
          disabled: false
        }));
      }
    }));

    this._subscriptions.push(this._accounting.data$.subscribe((d: Data) => {
      if(!d || !this.data) { return; }

      this.data[0].key = d.overall.project.name;
      this.data[0].values = d.overall.values;

      d.aggregates.forEach((a: ProjectAggregate) => {
        let index = this.data.findIndex((s: GraphSeries) => s.key == a.project.name);

        if(index > -1) {
          this.data[index].values = a.values;
        }
      });

      this.update();
    }));
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s: Subscription) => s.unsubscribe());
  }

  update() {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    // Without this timeout, the chart is not correctly setup
    setTimeout(() => {
      this.nvD3.chart.update();
    }, 50);
  }

  ngAfterViewInit() {
    this.update();
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
