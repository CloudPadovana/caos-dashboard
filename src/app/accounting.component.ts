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

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService } from './api.service';

import {
  CAOS_PROJECT_TAG_KEY,
  IProject as IBaseProject,
  Project as BaseProject,
} from './project';

import { CAOS_HYPERVISOR_TAG_KEY } from './hypervisor';

import { DateRange } from './components/daterange.component';
import {
  GraphComponent,
  GraphConfig,
  GraphSetConfig,

  Metrics,
  GraphAggregateSeriesConfig,
  GraphExpressionSeriesConfig
} from './components/graph.component';

import {
  SeriesService,
  SeriesData,

  Sample,
} from './series.service';

import moment from 'moment';

interface IProject extends IBaseProject { }

class Project extends BaseProject implements IProject {
  constructor(kwargs: IProject) {
    super(kwargs);
  }
}

const QUERY = `
query {
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
  }
}`

interface QueryResult {
  projects: IProject[];
}

interface StatsSeries {
  value: number;
  name: string;
  overall_percent: number;
}

@Component({
  templateUrl: 'accounting.component.html'
})
export class AccountingComponent implements OnInit, AfterViewInit {
  @ViewChild(GraphComponent) graph: GraphComponent;

  projects: Project[] = [];

  selected_set: GraphSetConfig;
  date_range: DateRange;

  stats: StatsSeries[] = [];
  fetching_stats: number;
  get fetching_stats_percent(): number {
    if(!this.fetching_stats) { return 0 };

    return this.fetching_stats * 100;
  }

  graph_config: GraphConfig;

  constructor(private _api: ApiService,
              private _series: SeriesService) { }

  ngOnInit() {
    this.fetching_stats = undefined;
  }

  ngAfterViewInit() {
    // done here to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.date_range = this.graph.date_range;

    this.fetch_projects();

    this.selected_set = this.graph.selected_set;
    this.update_stats();
  }

  fetch_projects() {
    this._api.graphql_query<QueryResult>({
      query: QUERY
    })
      .map(({ data }) => data).subscribe(
        (data: QueryResult) => {

          this.projects = data.projects
            .map((p: IProject) => new Project(p));

          this.build_graph_configs();
        });
  }

  update_stats() {
    if(!this.selected_set) { return; }
    if(!this.selected_set.series) { return; }
    if(!this.date_range) { return; }

    let series = this.selected_set.series;
    let granularity = moment(this.date_range.end).diff(this.date_range.start, 'seconds');

    this.fetching_stats = 0;
    let increment: number = 1/series.length;

    // drop old data
    this.stats = [];

    let overall = NaN;
    this._series.query(series, this.date_range.start, this.date_range.end, granularity)
      .map((s: SeriesData) => {
        let value = NaN;

        if (s.samples && s.samples.length > 0) {
          value = s.samples[0].v;
        }

        if (s.config.label === 'OVERALL') {
          overall = value;
        }

        return <StatsSeries>({
          value: value,
          name: s.config.label,
          overall_percent: NaN
        });
      })
      .subscribe(
        (s: StatsSeries) => {
          this.fetching_stats += increment;
          // store new data
          this.stats = [...this.stats, s];
        },
        () => { },
        () => {
          // compute overall percent
          this.stats.forEach(
            (s: StatsSeries) => {
              s.overall_percent = s.value / overall;
            });

          this.fetching_stats = undefined;
        }
      );
  }

  build_graph_configs() {
    let cfg = <GraphConfig>({
      sets: []
    });
    let idx: number;


    cfg.sets.push({
      label: "CPU Time",
      y_axis_label: "hours",

      series: []
    });
    idx = cfg.sets.length-1;

    cfg.sets[idx].series.push(new GraphAggregateSeriesConfig({
      label: "OVERALL",
      metric: Metrics.VM_CPU_TIME_USAGE,
      period: 3600,
      tag: {key: CAOS_PROJECT_TAG_KEY},
      downsample: "SUM",
      aggregate: "SUM"
    }));

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "BARE",
      metric: Metrics.IDENTITY,
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

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "VCPU",
      metric: Metrics.IDENTITY,
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

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "QUOTA",
      metric: Metrics.IDENTITY,
      expression: "x * GRANULARITY/3600",
      terms: {
        x: {
          metric: Metrics.QUOTA_VCPUS,
          period: 0,
          tag: {key: CAOS_PROJECT_TAG_KEY},
          downsample: "AVG",
          aggregate: "SUM"
        }
      }
    }));

    for(let p of this.projects) {
      cfg.sets[idx].series.push(new GraphAggregateSeriesConfig({
        label: p.name,
        metric: Metrics.VM_CPU_TIME_USAGE,
        period: 3600,
        tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}]
      }));
    }


    cfg.sets.push({
      label: "Wallclock Time",
      y_axis_label: "hours",

      series: []
    });
    idx = cfg.sets.length-1;

    cfg.sets[idx].series.push(new GraphAggregateSeriesConfig({
      label: "OVERALL",
      metric: Metrics.VM_WALLCLOCK_TIME_USAGE,
      period: 3600,
      tag: {key: CAOS_PROJECT_TAG_KEY},
      downsample: "SUM",
      aggregate: "SUM"
    }));

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "BARE",
      metric: Metrics.IDENTITY,
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

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "VCPU",
      metric: Metrics.IDENTITY,
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

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "QUOTA",
      metric: Metrics.IDENTITY,
      expression: "x * GRANULARITY/3600",
      terms: {
        x: {
          metric: Metrics.QUOTA_VCPUS,
          period: 0,
          tag: {key: CAOS_PROJECT_TAG_KEY},
          downsample: "AVG",
          aggregate: "SUM"
        }
      }
    }));

    for(let p of this.projects) {
      cfg.sets[idx].series.push(new GraphAggregateSeriesConfig({
        label: p.name,
        metric: Metrics.VM_WALLCLOCK_TIME_USAGE,
        period: 3600,
        tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}]
      }));
    }


    cfg.sets.push({
      label: "CPU Efficiency",
      y_axis_label: "%",

      series: []
    });
    idx = cfg.sets.length-1;

    cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
      label: "OVERALL",
      metric: Metrics.IDENTITY,
      expression: "x / y * 100",
      terms: {
        x: {
          metric: Metrics.VM_CPU_TIME_USAGE,
          period: 3600,
          tag: {key: CAOS_PROJECT_TAG_KEY},
          aggregate: "SUM",
          downsample: "SUM"
        },
        y: {
          metric: Metrics.VM_WALLCLOCK_TIME_USAGE,
          period: 3600,
          tag: {key: CAOS_PROJECT_TAG_KEY},
          aggregate: "SUM",
          downsample: "SUM"
        },
      }
    }));

    for(let p of this.projects) {
      cfg.sets[idx].series.push(new GraphExpressionSeriesConfig({
        label: p.name,
        metric: Metrics.IDENTITY,
        expression: "x / y * 100",
        terms: {
          x: {
            metric: Metrics.VM_CPU_TIME_USAGE,
            period: 3600,
            tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}],
            aggregate: "NONE",
            downsample: "SUM"
          },
          y: {
            metric: Metrics.VM_WALLCLOCK_TIME_USAGE,
            period: 3600,
            tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}],
            aggregate: "NONE",
            downsample: "SUM"
          },
        }
      }));
    }

    this.graph_config = cfg;
  }
}
