////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2016 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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

import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Project, Aggregate, ProjectAggregate, Data } from '../accounting.service';
import { AggregateDownloader } from './aggregate-downloader';

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
<button type="button" class="btn btn-primary btn-xs" (click)="select_all()" tooltip="Click here to select all projects.">Select all</button>
<button type="button" class="btn btn-primary btn-xs" (click)="deselect_all()" tooltip="Click here to deselect all projects.">Deselect all</button>
<button class="btn btn-primary btn-xs" type="button" (click)="downloader.download_CSV('data.csv')" tooltip="Download raw data in CSV format.">Download data<i class="fa fa-fw fa-download"></i></button>

<p>To select a single project, <b>double click</b> on its marker.</p>
`
})
export class AggregateGraphComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(nvD3) nvD3: nvD3;
  data: GraphSeries[];
  downloader: AggregateDownloader;

  _subscriptions: Subscription[];
  constructor(private _accounting: AccountingService) {
    this.downloader = new AggregateDownloader(_accounting);
  }

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

  select_all() {
    this.data.forEach((d: GraphSeries) => d.disabled = false);
    this.update();
  }

  deselect_all() {
    this.data.forEach((d: GraphSeries) => d.disabled = true);
    this.update();
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
      interpolate: 'linear',
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
