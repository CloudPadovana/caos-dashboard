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

import { Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

import { SelectItem } from 'primeng/primeng';

import * as d3 from 'd3';
import { nvD3 } from 'ng2-nvd3';
import moment from 'moment';

import { ApiService } from '../api.service';
import { DateRange, DateRangeComponent } from './daterange.component';
//import { AggregateDownloader } from '../aggregate-downloader';
import * as Metrics from '../metrics';
export { Metrics };

interface Sample {
  ts: Date;
  unix_ts: number;
  v: number;
}

interface Series {
  // nvd3 REQUIRES this type of struct
  key: string;
  values: Sample[];
  disabled: boolean;
}

export interface GraphTagConfig {
  key: string;
  value?: string;
}

export interface GraphSeriesConfig {
  label?: string;
  metric: Metrics.IMetric;
  period: number;
  granularity?: number;
  tags?: GraphTagConfig[];
  tag?: GraphTagConfig;
  aggregate?: string;
  downsample?: string;
}

export interface GraphSetConfig {
  label: string;
  series: GraphSeriesConfig[];
}

export interface GraphConfig {
  sets: GraphSetConfig[];
}

interface QueryResult {
  aggregate: Sample[];
}

const UTC_FORMAT = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");

@Component({
  selector: 'graph',
  templateUrl: 'components/graph.component.html'
})
export class GraphComponent {
  @ViewChild(nvD3) nvD3: nvD3;
  //downloader: AggregateDownloader;

  private _config: GraphConfig;
  @Input()
  set config(c: GraphConfig) {
    this._config = c;
    this.sets = [];
    this._selected_set = undefined;

    if(c && c.sets.length) {
      for(let s of c.sets) {
        this.sets.push({label: s.label, value: s});
      }
      this._selected_set = c.sets[0];
    }
    this.update();
  }
  get config(): GraphConfig {
    return this._config;
  }

  @Input() show_set_selector: boolean = true;

  @Input() show_daterange_selector: boolean = true;

  @Input() show_granularity_selector: boolean = true;

  sets: SelectItem[] = [];
  private _selected_set: GraphSetConfig;
  set selected_set(c: GraphSetConfig) {
    this._selected_set = c;
    this.update();
  }
  get selected_set(): GraphSetConfig {
    return this._selected_set;
  }

  granularities: SelectItem[] = [];
  private _selected_granularity: moment.MomentInputObject;
  set selected_granularity(g: moment.MomentInputObject) {
    this._selected_granularity = g;
    this.update();
  }
  get selected_granularity(): moment.MomentInputObject {
    return this._selected_granularity;
  }

  data: Series[] = [];
  fetching: number;
  get fetching_percent(): number {
    if(!this.fetching) { return 0 };

    return this.fetching * 100;
  }

  private _date_range: DateRange;
  @Input()
  set date_range(d: DateRange) {
    this._date_range = d;
    this.update();
  }
  get date_range(): DateRange {
    return this._date_range;
  }

  constructor(private _api: ApiService) {
    //this.downloader = new AggregateDownloader();

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

  update() {
    if(!this.config) { return };
    if(!this.selected_set) { return };
    if(!this.selected_granularity) { return };
    if(!this.date_range) { return };

    this.fetch_data()
      .subscribe((data: Series[]) => {
        this.fetching = undefined;
        this.data.splice(0, this.data.length);
        this.data = data;
        this.refresh_graph();
      });
  }

  private fetch_data(): Observable<Series[]> {
    let series = this.selected_set.series;

    let granularity = moment.duration(this.selected_granularity).asSeconds();

    this.fetching = 0;
    let increment: number = 1/series.length;

    let obs: Array< Observable<Series> > = [];
    let req: Observable<Series>;

    for(let s of series) {
      let query = `
query($series: SeriesGroup!, $from: Datetime!, $to: Datetime!, $granularity: Int, $function: AggregateFunction, $downsample: AggregateFunction) {
  aggregate(series: $series, from: $from, to: $to, granularity: $granularity, function: $function, downsample: $downsample) {
    unix_ts: unix_timestamp
    v: value
  }
}`;

      let variables = {
        from: UTC_FORMAT(this.date_range.start),
        to: UTC_FORMAT(this.date_range.end),
        series: {
          metric: {
            name: s.metric.name
          },
          period: s.period,
          tag: s.tag,
          tags: s.tags,
        },
        granularity: s.granularity || granularity,
        function: s.aggregate || "SUM",
        downsample: s.downsample || "NONE",
      };

      req = this._api.graphql_query<QueryResult>({
        query:  query,
        variables: variables
      })
        .map(({ data }) => data)
        .map((data: QueryResult) => {
          this.fetching += increment;

          return <Series>({
            disabled: false,
            key: s.label || s.metric.label,
            values: data.aggregate.map(
              (sample: Sample) => <Sample>({
                ts: new Date(sample.unix_ts * 1000),
                v: sample.v * s.metric.scale
              }))
          });
        });

      obs.push(req)
    }

    return Observable.forkJoin(obs);
  }

  refresh_graph() {
    if (!this.nvD3) { return };
    if (!this.nvD3.chart) { return };

    this.update_chart_options();
    this.nvD3.updateWithOptions(this.options);

    // Without this timeout, the chart is not correctly setup
    setTimeout(() => {
      this.nvD3.chart.update();
    }, 500);
  }

  select_all() {
    this.data.forEach((s: Series) => s.disabled = false);
    this.refresh_graph();
  }

  deselect_all() {
    this.data.forEach((s: Series) => s.disabled = true);
    this.refresh_graph();
  }

  private update_chart_options() {
    let s = this.selected_set;
    let metric =  s.series[0].metric;

    let chart = this.options.chart;

    chart.yAxis.axisLabel = metric.unit;
    chart.tooltip.valueFormatter = metric.value_formatter;
    chart.yAxis.tickFormat = metric.tick_formatter;
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
        valueFormatter: function(d: any) {
          return d3.format('.05s')(d);
        },
        headerFormatter: function (d: any) {
          return d3.time.format("%a %b %d %H:%M %Y %Z")(new Date(d));
        }
      }
    }
  };
}
