////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2017, 2018 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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

import { Component, Input, Output, ElementRef, EventEmitter, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import * as d3 from 'd3';
import { NvD3Component } from 'ng2-nvd3';
import * as moment from 'moment';

//import { AggregateDownloader } from '../aggregate-downloader';

import { DateRange, DateRangeService } from '../daterange.service';
import { Item } from './dropdown.component';

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

import * as Series from '../series';
export { Series };

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

type Granularity = moment.MomentInputObject;

interface IAlert {
  type: string;
  dismissible: boolean;
  msg: string;
}

const PPP_THRESHOLD = 2;
const PPP_ALERT = <IAlert>({
  type: "warning",
  dismissible: true,
  msg: `Trying to plot more than ${PPP_THRESHOLD} points per pixel. Granularity has been automatically increased.`,
});

@Component({
  selector: 'graph',
  templateUrl: 'graph.component.html'
})
export class GraphComponent implements AfterViewInit {
  help_collapsed: Boolean = true;

  @ViewChild('nvd3') nvD3: NvD3Component;
  //downloader: AggregateDownloader;

  private _config: GraphConfig;
  @Input()
  set config(c: GraphConfig) {
    this._config = c;
    this.sets = [];
    this.selected_set = undefined;

    if(c && c.sets) {
      this.sets = c.sets.map((s: GraphSetConfig) => <Item<GraphSetConfig>>({
        label: s.label,
        value: s
      }));
    };
  }
  get config(): GraphConfig {
    return this._config;
  }

  @Input() show_set_selector: boolean = true;

  @Input() show_granularity_selector: boolean = true;

  sets: Item<GraphSetConfig>[] = [];
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

  granularities: Item<Granularity>[] = [];
  private _selected_granularity: Granularity;
  @Output() on_granularity_selected = new EventEmitter<Granularity>();
  @Input()
  set selected_granularity(g: Granularity) {
    this._selected_granularity = g;
    this.on_granularity_selected.emit(this._selected_granularity);
    this.update();
  }
  get selected_granularity(): Granularity {
    return this._selected_granularity;
  }

  linewidths: Item<number>[] = [];
  private _selected_linewidth: number;
  set selected_linewidth(n: number) {
    if(n == this._selected_linewidth) { return; }

    let data = this.data.splice(0);
    data.forEach((s: GraphSeries) => s.strokeWidth = n);
    this.data = data;
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

  get date_range(): DateRange {
    return this._daterange.range;
  }

  alerts: IAlert[] = [];

  constructor(private _series: SeriesService, private _daterange: DateRangeService) {
    _daterange.range_changed.subscribe(() => this.update());
    //this.downloader = new AggregateDownloader();

    this.linewidths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map((n: number) => <Item<number>>({
        label: `${n}`,
        value: n
      }));

    this.granularities = [1, 2, 3, 6, 12, 24, 48, 72, 24*7]
      .map((n: number) => <Item<Granularity>>({
        label: moment.duration(n, "hours").humanize(),
        value: <Granularity>({hours: n})
      }));
  }

  ngAfterViewInit() {
    // done here to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.fetching = undefined;
  }

  add_alert(alert: IAlert) {
    if(!this.alerts) { return; }
    if(!alert) { return; }
    if(this.alerts.indexOf(alert) > -1) { return; }

    this.alerts.push(alert);
  }

  dismiss_alert(alert: any) {
    if(!this.alerts) { return; }
    if(!alert) { return; }

    this.alerts = this.alerts.filter((a: IAlert) => a !== alert);
  }

  private ppp_ratio(granularity: Granularity): number {
    let g = moment.duration(granularity).asSeconds();
    let rect = this.nvD3.el.getBoundingClientRect();
    let width = rect.width;
    let range = moment(this.date_range.end).diff(this.date_range.start, 'seconds');
    let points = range / g;
    let ratio = points / width;
    return ratio;
  }

  private find_good_granularity(): Granularity {
    for(let g of this.granularities) {
      let ratio = this.ppp_ratio(g.value);
      if(ratio <= PPP_THRESHOLD) {
        return g.value;
      }
    }

    return null;
  }

  check_ppp(): boolean {
    let granularity = this.selected_granularity;
    let ratio = this.ppp_ratio(granularity);

    if(ratio <= PPP_THRESHOLD) {
      return true;
    } else {
      let good_granularity = this.find_good_granularity();
      setTimeout(() => {
        this.selected_granularity = good_granularity;
        this.add_alert(PPP_ALERT);
      });
      return false;
    }
  }

  update() {
    if(!this.config) { return };
    if(!this.selected_set) { return };
    if(!this.selected_granularity) { return };
    if(!this.date_range) { return };

    if(!this.check_ppp()) { return };
    this.update_data();
  }

  update_data() {
    if(this.fetching != undefined) { return; }

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
        () => { this.fetching = undefined; },
        () => {
          this.fetching = undefined;
          this.refresh_graph();
        }
      );
  }

  refresh_graph() {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    this.update_chart_options();
    this.nvD3.updateWithOptions(this.options);
    this.nvD3.updateWithData(this.data);
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
    if(!this.selected_set) { return };

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
