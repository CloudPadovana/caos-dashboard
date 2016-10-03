import { Component, AfterViewInit, OnChanges, Input, ViewChild } from '@angular/core';
import { ApiService, Project, Metric, Aggregate, DateRange } from '../api.service';

import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';
import moment from 'moment';

@Component({
  selector: 'aggregate-graph',
  templateUrl: 'components/aggregate-graph.component.html'
})
export class AggregateGraphComponent implements AfterViewInit, OnChanges {
  @Input() project: Project;
  @Input() metric: Metric;
  @Input() period: number;
  @Input() daterange: DateRange;
  @Input() granularity: number;
  @Input() show_table: boolean = false;
  @Input() overall: boolean = false;

  constructor(private _api: ApiService) {}

  @ViewChild(nvD3)
  nvD3: nvD3;

  ngOnChanges() {
    if (!this.metric) { return };
    if (!this.period) { return };
    if (!this.daterange) { return };
    if (!this.granularity) { return };

    if (this.project) {
      this.update_samples_for_one_project();
    } else if (this.overall) {
      this.update_samples_for_all_projects();
    };
  }

  private update_chart(): void {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    if (this.daterange) {
      //this.nvD3.chart.brushExtent([this.daterange.start, this.daterange.end]);

      let d1 = moment(this.daterange.start);
      let dt = moment(this.daterange.end).diff(d1, 'days');
      let fmt = "";
      if (dt > 90) {
        fmt = '%d %b';
      } else if (dt > 7) {
        fmt = '%b %d %H:%M';
      } else {
        fmt = '%b %d';
      }

      this.nvD3.chart.xAxis.tickFormat(function(d: any) {
        return d3.time.format(fmt)(new Date(d));})
    }

    this.nvD3.chart.update();
    // console.log("chart", this.nvD3.chart.focus.dispatch);
    // this.nvD3.chart.focus.dispatch.on('brush', function(extent:any, brush:any){ console.log("brush",extent, brush); });
    // this.nvD3.chart.focus.dispatch.on('onBrush', function(e:any){ console.log("onBrush",e); });
    // this.nvD3.chart.focus.dispatch.on('renderEnd', function(e:any){ console.log("renderend",e); });

  }

  private values: Aggregate[] = [];
  private get values_sum(): number {
    return this.values.map((a: Aggregate) => a.sum).reduce((acc, cur) => acc + cur, 0);
  }

  private update_samples_for_one_project(): void {
    this._api.aggregate_for_one_project(this.project, this.period, this.metric, this.daterange, this.granularity)
      .subscribe((a: Aggregate[]) => {
        this.values = a;
        this.data = [{
          values: a,
          key: this.project.name
        }];

        setTimeout(() => {
          this.update_chart();
        }, 50);
      });
  }

  private update_samples_for_all_projects(): void {
    this._api.aggregate_for_all_projects(this.period, this.metric, this.daterange, this.granularity)
      .subscribe((a: Aggregate[]) => {
        this.values = a;
        this.data = [{
          values: a,
          key: "Overall"
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
      margin: {
        top: 20,
        right: 50,
        bottom: 50,
        left: 50
      },
      x: function(d: Aggregate) { return d.start; },
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
