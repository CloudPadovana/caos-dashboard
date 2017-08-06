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

import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/primeng';
import moment from 'moment';

import { ApiService, DATE_FORMAT } from './api.service';
import * as Metrics from './metrics';

import {
  CAOS_PROJECT_TAG_KEY,
  IProject as IBaseProject,
  Project as BaseProject,
} from './project';

import { CAOS_HYPERVISOR_TAG_KEY } from './hypervisor';

import { DateRange } from './components/daterange.component';
import { GraphConfig, AggregateSeries, ExpressionSeries } from './components/graph.component';

interface Aggregate {
  ts: Date;
  v: number;
}

interface Series {
  aggregate: Aggregate[];
}

interface IProject extends IBaseProject {
  series: Series[];
}

class Project extends BaseProject implements IProject {
  overall: Project;
  series: Series[];
  metric: Metrics.Metric;

  constructor(kwargs: IProject, metric: Metrics.Metric, overall?: Project) {
    super(kwargs);
    this.metric = metric;

    if(overall) {
      this.overall = overall;
    } else {
      this.overall = this;
    }
  }

  get aggregate_value(): number {
    if(!this.series.length) { return 0; }
    if(!this.series[0].aggregate.length) { return 0;}

    return this.series[0].aggregate[0].v * this.metric.scale;
  }

  get aggregate_overall_percent(): number {
    if(!this.overall) { return NaN };

    return this.aggregate_value / this.overall.aggregate_value
  }
}

const QUERY = `
query($metric_name: String!, $period: Int!, $from: Datetime!, $to: Datetime!, $granularity: Int, $function: AggregateFunction) {
  projects: tags(key: "${CAOS_PROJECT_TAG_KEY}") {
    id: value
    metadata: last_metadata {
      last_updated: timestamp

      name: field(key: "name")
      description: field(key: "description")
      enabled: boolean_field(key: "enabled")
      parent_id: field(key: "parent_id")
      is_domain: boolean_field(key: "is_domain")
      domain_id: field(key: "domain_id")
      link: field(key: ["links", "self"])
    }

    series(tags: [], period: $period, metric: {name: $metric_name}) {
      aggregate(from: $from, to: $to, granularity: $granularity, function: $function) {
        ts: timestamp
        v: value
      }
    }
  }

 overall: aggregate(series: {period: $period, metric: {name: $metric_name}, tag: {key: "${CAOS_PROJECT_TAG_KEY}"}}, from: $from, to: $to, granularity: $granularity, function: $function) {
    ts: timestamp
    v: value
  }
}`;

interface QueryResult {
  projects: IProject[];
  overall: Aggregate[];
}

import * as d3 from 'd3';
const UTC_FORMAT = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");

@Component({
  templateUrl: 'accounting.component.html'
})
export class AccountingComponent implements OnInit {
  projects: Project[] = [];
  overall: Project;
  get projects_with_overall(): Project[] {
    if(!this.overall) { return this.projects };

    return [this.overall].concat(this.projects);
  }

  date_range: DateRange;
  graph_config: GraphConfig;

  metrics: SelectItem[] = [];
  private _selected_metric: Metrics.Metric;
  set selected_metric(m: Metrics.Metric) {
    this._selected_metric = m;
    this.update();
  }
  get selected_metric(): Metrics.Metric {
    return this._selected_metric;
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

  constructor(private _api: ApiService) {
    let metrics = [
      Metrics.VM_CPU_TIME_USAGE,
      Metrics.VM_WALLCLOCK_TIME_USAGE,
      Metrics.VM_CPU_EFFICIENCY,
    ];

    for(let m of metrics) {
      this.metrics.push({label: m.label, value: m});
    }
    this.selected_metric = metrics[0];

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

  ngOnInit() {
    this.update();
  }

  update() {
    if(!this.date_range) { return };
    if(!this.selected_metric) { return };
    if(!this.selected_granularity) { return };

    let variables = {
      from: UTC_FORMAT(this.date_range.start),
      to: UTC_FORMAT(this.date_range.end),
      granularity: moment(this.date_range.end).diff(this.date_range.start, 'seconds'),
      function: "SUM",
      metric_name: this.selected_metric.name,
      period: 3600,
    };

    this._api.graphql_query<QueryResult>({
      query: QUERY,
      variables: variables
    })
      .map(({ data }) => data).subscribe(
        (data: QueryResult) => {
          this.overall = this.compute_overall(data.overall, this.selected_metric);

          this.projects = data.projects
            .map((p: IProject) => new Project(p, this.selected_metric, this.overall));

          this.build_graph_config();
        });
  }

  compute_overall(overall: Aggregate[], metric: Metrics.Metric): Project {
    return new Project({
      id: "",
      metadata: {
        name: "OVERALL",
        last_updated: new Date(),
        description: "",
        enabled: true,
        parent_id: "",
        is_domain: false,
        domain_id: "",
        link: "",
      },

      series: [{
        aggregate: overall
      }]
    }, metric);
  }

  build_graph_config() {
    let metric = this.selected_metric;
    let granularity = moment.duration(this.selected_granularity).asSeconds();

    let cfg = <GraphConfig>({
      sets: [
        {
          label: metric.label,
          series: []
        }
      ]
    });

    cfg.sets[0].series.push(new AggregateSeries({
      label: "OVERALL",
      metric: metric,
      period: 3600,
      granularity: granularity,
      tag: {key: CAOS_PROJECT_TAG_KEY},
      downsample: "SUM",
      aggregate: "SUM"
    }));

    switch(metric) {
    case Metrics.VM_CPU_TIME_USAGE:
      cfg.sets[0].series.push(new ExpressionSeries({
        label: "TOTAL",
        expression: "x * GRANULARITY/3600",
        terms: {
          x: {
            metric: Metrics.HYPERVISOR_CPUS_TOTAL,
            period: 0,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            downsample: "AVG",
            aggregate: "SUM"
          }
        }
      }));
      break;

    case Metrics.VM_WALLCLOCK_TIME_USAGE:
      cfg.sets[0].series.push(new ExpressionSeries({
        label: "TOTAL",
        expression: "x * GRANULARITY/3600",
        terms: {
          x: {
            metric: Metrics.HYPERVISOR_VCPUS_TOTAL,
            period: 0,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            downsample: "AVG",
            aggregate: "SUM"
          }
        }
      }));
      break;
    }

    for(let p of this.projects) {
      cfg.sets[0].series.push(
        new AggregateSeries({
          label: p.name,
          metric: metric,
          period: 3600,
          granularity: granularity,
          tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}],
          downsample: "SUM",
          aggregate: "SUM"
        }));
    }

    this.graph_config = cfg;
  }
}
