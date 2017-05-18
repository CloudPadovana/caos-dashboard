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

import { ApiService, DATE_FORMAT } from './api.service';

import {
  CAOS_PROJECT_TAG_KEY,
  IProject as IBaseProject,
  Project as BaseProject,
} from './project';

import {
  CAOS_DOMAIN_TAG_KEY,
  IDomain,
} from './domain';

import { CAOS_HYPERVISOR_TAG_KEY } from './hypervisor';

import { DateRange } from './components/daterange.component';
import { GraphConfig, Metrics } from './components/graph.component';

interface IProject extends IBaseProject {
  vcpus_total: number;
  vcpus_usage: number;

  vms_total: number;
  vms_active: number;
  vms_deleted: number;

  memory_total: number;
  memory_usage: number;
}

class Project extends BaseProject implements IProject {
  vcpus_total: number = 0;
  vcpus_usage: number = 0;

  vms_total: number = 0;
  vms_active: number = 0;
  vms_deleted: number = 0;

  memory_total: number = 0;
  memory_usage: number = 0;

  constructor(kwargs?: IProject) {
    super(kwargs);

    if(kwargs) {
      return Object.assign(this, kwargs);
    }
  }

  get vcpus_usage_percent(): number {
    return this.vcpus_usage / 3600 / this.vcpus_total * 100.0;
  }

  get memory_usage_percent(): number {
    return this.memory_usage / 3600 / this.memory_total * 100.0;
  }

  get vms_active_percent(): number {
    return this.vms_active / this.vms_total * 100.0;
  }
}

const QUERY = `
query {
  domains: tags(key: "${CAOS_DOMAIN_TAG_KEY}") {
    id: value
    metadata: last_metadata {
      last_updated: timestamp

      name: field(key: "name")
      description: field(key: "description")
      enabled: boolean_field(key: "enabled")
      link: field(key: ["links", "self"])
    }
  }

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

    vcpus_total: last_sample_value(series: {metric: {name: "quota.vcpus"}, period: 0})
    vcpus_usage: last_sample_value(series: {metric: {name: "vm.vcpus.usage"}, period: 3600})

    memory_total: last_sample_value(series: {metric: {name: "quota.memory"}, period: 0})
    memory_usage: last_sample_value(series: {metric: {name: "vm.memory.usage"}, period: 3600})

    vms_total: last_sample_value(series: {metric: {name: "quota.instances"}, period: 0})
    vms_active: last_sample_value(series: {metric: {name: "vms.active"}, period: 3600})
    vms_deleted: last_sample_value(series: {metric: {name: "vms.deleted"}, period: 3600})
  }
}`

interface QueryResult {
  domains: IDomain[];
  projects: IProject[];
}

@Component({
  templateUrl: 'projects.component.html'
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  overall = new Project();

  date_range: DateRange;

  constructor(private _api: ApiService) { }

  ngOnInit() {
    this.fetch_data();
  }

  fetch_data() {
    this._api.graphql_query<QueryResult>({
      query: QUERY
    })
      .map(({ data }) => data).subscribe(
        (data: QueryResult) => {

          this.projects = data.projects
            .map((p: IProject) => new Project(p));

          this.build_graph_configs();
          this.compute_overall();
        });
  }

  compute_overall(): Project {
    return this.projects
      .reduce((acc: Project, curr: Project) => {
        acc.vcpus_total += curr.vcpus_total;
        acc.vcpus_usage += curr.vcpus_usage;

        acc.vms_total += curr.vms_total;
        acc.vms_active += curr.vms_active;
        acc.vms_deleted += curr.vms_deleted;

        acc.memory_total += curr.memory_total;
        acc.memory_usage += curr.memory_usage;

        return acc;
      }, this.overall);
  }

  usage_class(percent: number): string {
    if(percent >= 90) { return 'bg-danger' }
    if(percent >= 70) { return 'bg-warning' }

    return 'bg-success';
  }

  graph_config: GraphConfig = <GraphConfig>({
    sets: [
      {
        label: "CPU Time",
        series: [
          {
            metric: Metrics.VM_CPU_TIME_USAGE,
            period: 3600,
            tag: {key: CAOS_PROJECT_TAG_KEY},
          },
          {
            label: "TOTAL",
            metric: Metrics.HYPERVISOR_CPUS_TOTAL,
            period: 0,
            downsample: "AVG",
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
          }
        ]
      },
      {
        label: "Wallclock Time",
        series: [
          {
            metric: Metrics.VM_WALLCLOCK_TIME_USAGE,
            period: 3600,
            tag: {key: CAOS_PROJECT_TAG_KEY},
          },
          {
            label: "TOTAL",
            metric: Metrics.HYPERVISOR_VCPUS_TOTAL,
            period: 0,
            downsample: "AVG",
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
          }
        ]
      }
    ]
  });

  graph_config_for_project: { [key: string]: GraphConfig } = {};
  build_graph_configs() {
    for(let p of this.projects) {
      let cfg = <GraphConfig>({
        sets: [
          {
            label: "CPU Time",
            series: [
              {
                metric: Metrics.VM_CPU_TIME_USAGE,
                period: 3600,
                tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}]
              }
            ]
          },
          {
            label: "Wallclock Time",
            series: [
              {
                metric: Metrics.VM_WALLCLOCK_TIME_USAGE,
                period: 3600,
                tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}]
              },
              {
                metric: Metrics.QUOTA_VCPUS,
                period: 0,
                downsample: "AVG",
                tags: [{key: CAOS_PROJECT_TAG_KEY, value: p.id}]
              }
            ]
          }
        ]
      });

      this.graph_config_for_project[p.id] = cfg;
    }
  }
}
