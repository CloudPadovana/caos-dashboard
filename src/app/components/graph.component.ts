////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2017 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
//
////////////////////////////////////////////////////////////////////////////////

import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { SelectItem } from 'primeng/primeng';

import * as d3 from 'd3';
import { nvD3 } from 'ng2-nvd3';
import moment from 'moment';

import { DateRange, DateRangeComponent } from './daterange.component';
//import { AggregateDownloader } from '../aggregate-downloader';

import {
  SeriesService,

  Sample,
  SeriesConfig,
  SeriesData,

  IAggregateSeriesParams,
  AggregateSeriesConfig,

  IExpressionSeriesParams,
  ExpressionSeriesConfig,

  Metrics
} from '../series.service';
export { Metrics };

interface GraphSeries {
  // nvd3 REQUIRES this type of struct
  values: Sample[];
  key: string;
  disabled: boolean;
  strokeWidth: number;
}

export interface GraphSeriesConfig extends SeriesConfig {
  tooltip_value_formatter?(v: number): string;
}

export interface IGraphAggregateSeriesParams extends IAggregateSeriesParams {
  tooltip_value_formatter?(v: number): string;
}

export class GraphAggregateSeriesConfig extends AggregateSeriesConfig implements GraphSeriesConfig {
  params: IGraphAggregateSeriesParams;

  constructor(kwargs: IGraphAggregateSeriesParams) {
    super(kwargs);
  }

  tooltip_value_formatter(v: number): string {
    if (this.params.tooltip_value_formatter) {
      return this.params.tooltip_value_formatter(v);
    } else {
      return this.params.metric.value_formatter(v);
    }
  }
}

export interface IGraphExpressionSeriesParams extends IExpressionSeriesParams {
}

export class GraphExpressionSeriesConfig extends ExpressionSeriesConfig implements GraphSeriesConfig {
  params: IGraphExpressionSeriesParams;

  constructor(kwargs: IGraphExpressionSeriesParams) {
    super(kwargs);
  }
}

export interface GraphSetConfig {
  label: string;
  y_axis_label: string;
  y_axis_tick_formatter?(v: number): string;

  series: GraphSeriesConfig[];
}

export interface GraphConfig {
  sets: GraphSetConfig[];
}

@Component({
  selector: 'graph',
  templateUrl: 'graph.component.html'
})
export class GraphComponent implements AfterViewInit {
  @ViewChild(nvD3) nvD3: nvD3;
  //downloader: AggregateDownloader;

  private _config: GraphConfig;
  @Input()
  set config(c: GraphConfig) {
    this._config = c;
    this.sets = [];
    this.selected_set = undefined;

    if(c && c.sets.length > 0) {
      setTimeout(
        () => {
          this.sets = c.sets.map((s: GraphSetConfig) => <SelectItem>({
            label: s.label,
            value: s
          }));

          this.selected_set = c.sets[0];
        }
      );
    }

    this.update();
  }
  get config(): GraphConfig {
    return this._config;
  }

  @Input() show_set_selector: boolean = true;

  @Input() show_daterange_selector: boolean = true;

  @Input() show_granularity_selector: boolean = true;

  sets: SelectItem[];
  private _selected_set: GraphSetConfig;
  @Output() on_set_selected = new EventEmitter<GraphSetConfig>();
  @Input()
  set selected_set(c: GraphSetConfig) {
    this._selected_set = c;
    this.on_set_selected.emit(this._selected_set);
    this.update();
  }
  get selected_set(): GraphSetConfig {
    return this._selected_set;
  }

  granularities: SelectItem[] = [];
  private _selected_granularity: moment.MomentInputObject;
  @Output() on_granularity_selected = new EventEmitter<moment.MomentInputObject>();
  @Input()
  set selected_granularity(g: moment.MomentInputObject) {
    this._selected_granularity = g;
    this.on_granularity_selected.emit(this._selected_granularity);
    this.update();
  }
  get selected_granularity(): moment.MomentInputObject {
    return this._selected_granularity;
  }

  linewidths: SelectItem[] = [];
  private _selected_linewidth: number;
  set selected_linewidth(n: number) {
    this._selected_linewidth = n;
    this.refresh_graph();
  }
  get selected_linewidth(): number {
    return this._selected_linewidth;
  }

  data: GraphSeries[] = [];
  fetching: number;
  get fetching_percent(): number {
    if(!this.fetching) { return 0 };

    return this.fetching * 100;
  }

  private _date_range: DateRange;
  @Output() on_date_range_selected = new EventEmitter<DateRange>();
  @Input()
  set date_range(d: DateRange) {
    this._date_range = d;
    this.on_date_range_selected.emit(this._date_range);
    this.update();
  }
  get date_range(): DateRange {
    return this._date_range;
  }

  constructor(private _series: SeriesService) {
    //this.downloader = new AggregateDownloader();

    this.linewidths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map((n: number) => {return { label: `${n}`, value: n} });

    this.granularities = [
      {
        label: "1 hour",
        value: {hours: 1}
      },

      {
        label: "1 day",
        value: {days: 1}
      },

      {
        label: "1 week",
        value: {days: 7}
      },
    ];
    this.selected_granularity = this.granularities[0].value;
  }

  ngAfterViewInit() {
    // done here to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.fetching = undefined;
  }

  update() {
    if(!this.config) { return };
    if(!this.selected_set) { return };
    if(!this.selected_granularity) { return };
    if(!this.date_range) { return };

    this.update_data();
  }

  update_data() {
    let series = this.selected_set.series;
    let granularity = moment.duration(this.selected_granularity).asSeconds();

    this.fetching = 0;
    let increment: number = 1/series.length;

    // drop old data
    this.data.splice(0, this.data.length);

    this._series.query(series, this.date_range.start, this.date_range.end, granularity)
      .map((s: SeriesData) => <GraphSeries>({
        values: s.samples,
        disabled: false,
        strokeWidth: this.selected_linewidth,
        key: s.config.label,
      }))
      .subscribe(
        (g: GraphSeries) => {
          this.fetching += increment;
          // store new data
          this.data.push(g);
        },
        () => { },
        () => {
          this.fetching = undefined;
          this.refresh_graph();
        }
      );
  }

  refresh_graph() {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    this.data.forEach((cur: GraphSeries, index: number, array: GraphSeries[]) => {
      array[index].strokeWidth = this.selected_linewidth;
    });

    this.update_chart_options();
    this.nvD3.updateWithOptions(this.options);

    // Without this timeout, the chart is not correctly setup
    setTimeout(() => {
      this.nvD3.chart.update();
    }, 500);
  }

  select_all() {
    this.data.forEach((s: GraphSeries) => s.disabled = false);
    this.refresh_graph();
  }

  deselect_all() {
    this.data.forEach((s: GraphSeries) => s.disabled = true);
    this.refresh_graph();
  }

  private update_chart_options() {
    let s = this.selected_set;
    let chart = this.options.chart;

    chart.yAxis.axisLabel = s.y_axis_label;

    if (s.y_axis_tick_formatter) {
      chart.yAxis.tickFormat = s.y_axis_tick_formatter;
    }

    chart.tooltip.valueFormatter = (d: any, i: any): string => {
      let s = this.selected_set;
      if (s.series[i].tooltip_value_formatter) {
        return s.series[i].tooltip_value_formatter(d);
      } else {
        return d3.format('.05s')(d);
      }
    }
  }

  time_format(): string {
    let min = this.date_range.start;
    let max = this.date_range.end;
    let ticks = 15;

    let range = moment(max).diff(min, 'seconds');
    let secPerTick = (range/ticks);
    let oneDay = 86400;
    let oneYear = 31536000;

    if (secPerTick <= 45) {
      return "%H:%M:%S";
    }
    if (secPerTick <= 7200 || range <= oneDay) {
      return "%H:%M";
    }
    if (secPerTick <= 80000) {
      return "%m/%d %H:%M";
    }
    if (secPerTick <= 2419200 || range <= oneYear) {
      return "%m/%d";
    }
    return "%Y-%m";
    //return "%H:%M";
  }

  options = {
    chart: {
      type: 'lineChart',
      height: 350,
      margin: {
        top: 20,
        right: 50,
        bottom: 50,
        left: 50
      },
      x: (s: Sample) => s.ts,
      y: (s: Sample) => s.v,
      interpolate: 'linear',
      xAxis: {
        axisLabel: 'Date',
        tickFormat: (d: Date) => {
          let format = this.time_format();
          return d3.time.format(format)(d);
        }
      },
      xScale: d3.time.scale(),
      yAxis: {
        axisLabel: '',
        tickFormat: function(d: any) {
          return d3.format('.02s')(d);
        },
        axisLabelDistance: -10
      },
      forceY: [0],
      showLegend: true,
      legendPosition: 'top',
      legend: {
        maxKeyLength: 10,
        // height: 150,
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
        valueFormatter: function(d: any, i: any) { return d; },
        headerFormatter: function (d: any) {
          return d3.time.format("%a %b %d %H:%M %Y %Z")(new Date(d));
        }
      }
    }
  };
}
