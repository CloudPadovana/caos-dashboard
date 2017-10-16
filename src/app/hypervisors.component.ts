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
  CAOS_HYPERVISOR_TAG_KEY,
  IHypervisor as IBaseHypervisor,
  Hypervisor as BaseHypervisor,
} from './hypervisor';

import { DateRange } from './components/daterange.component';
import {
  GraphConfig,
  Metrics,
  Series,
  GraphAggregateSeriesConfig,
  GraphExpressionSeriesConfig
} from './components/graph.component';

interface IHypervisor extends IBaseHypervisor {
  cpus_total: number;
  vcpus_total: number;
  vcpus_used: number;

  running_vms: number;
  workload: number;

  ram_total: number;
  memory_total: number;
  memory_used: number;

  disk_total: number;
  disk_used: number;
  disk_free: number;
  disk_free_least: number;

  load_5m: number;
  load_10m: number;
  load_15m: number;
}

class Hypervisor extends BaseHypervisor implements IHypervisor {
  cpus_total: number = 0;
  vcpus_total: number = 0;
  vcpus_used: number = 0;

  running_vms: number = 0;
  workload: number = 0;

  ram_total: number = 0;
  memory_total: number = 0;
  memory_used: number = 0;

  disk_total: number = 0;
  disk_used: number = 0;
  disk_free: number = 0;
  disk_free_least: number = 0;

  load_5m: number = 0;
  load_10m: number = 0;
  load_15m: number = 0;

  constructor(kwargs?: IHypervisor) {
    super(kwargs);

    if(kwargs) {
      return (<any>Object).assign(this, kwargs);
    }
  }

  get cpus_used_percent(): number {
    return this.vcpus_used / this.cpus_total * 100.0;
  }

  get vcpus_used_percent(): number {
    return this.vcpus_used / this.vcpus_total * 100.0;
  }

  get ram_used_percent(): number {
    return this.memory_used / this.ram_total * 100.0;
  }

  get memory_used_percent(): number {
    return this.memory_used / this.memory_total * 100.0;
  }

}

const QUERY = `
query {
  hypervisors: tags(key: "${CAOS_HYPERVISOR_TAG_KEY}") {
    hostname: value
    metadata: last_metadata {
      last_updated: timestamp

      type: field(key: "hypervisor_type")

      status: field(key: "status")
      state: field(key: "state")
      cores: integer_field(key: "vcpus")
      ip: field(key: "host_ip")

      disabled_reason: field(key: ["service", "disabled_reason"])
    }

    cpus_total      : last_sample_value(series: {metric: {name: "hypervisor.cpus.total"}, period: 0})
    vcpus_total     : last_sample_value(series: {metric: {name: "hypervisor.vcpus.total"}, period: 0})
    vcpus_used      : last_sample_value(series: {metric: {name: "hypervisor.vcpus.used"}, period: 0})

    running_vms     : last_sample_value(series: {metric: {name: "hypervisor.vms.running"}, period: 0})
    workload        : last_sample_value(series: {metric: {name: "hypervisor.workload"}, period: 0})

    ram_total       : last_sample_value(series: {metric: {name: "hypervisor.ram.total"}, period: 0})
    memory_total    : last_sample_value(series: {metric: {name: "hypervisor.memory.total"}, period: 0})
    memory_used     : last_sample_value(series: {metric: {name: "hypervisor.memory.used"}, period: 0})

    disk_total      : last_sample_value(series: {metric: {name: "hypervisor.disk.total"}, period: 0})
    disk_used       : last_sample_value(series: {metric: {name: "hypervisor.disk.used"}, period: 0})
    disk_free       : last_sample_value(series: {metric: {name: "hypervisor.disk.free"}, period: 0})
    disk_free_least : last_sample_value(series: {metric: {name: "hypervisor.disk.free.least"}, period: 0})

    load_5m         : last_sample_value(series: {metric: {name: "hypervisor.load.5m"}, period: 0})
    load_10m        : last_sample_value(series: {metric: {name: "hypervisor.load.10m"}, period: 0})
    load_15m        : last_sample_value(series: {metric: {name: "hypervisor.load.15m"}, period: 0})
  }
}
`;

interface QueryResult {
  hypervisors: IHypervisor[];
}

@Component({
  templateUrl: 'hypervisors.component.html'
})
export class HypervisorsComponent implements OnInit {
  hypervisors: Hypervisor[] = [];
  total = new Hypervisor();

  constructor(private _api: ApiService) { }

  ngOnInit() {
    this.fetch_data();
  }

  usage_class(percent: number): string {
    if(percent >= 90) { return 'bg-danger' }
    if(percent >= 70) { return 'bg-warning' }

    return 'bg-success';
  }

  fetch_data() {
    this.hypervisors = [];

    this._api.graphql_query<QueryResult>({
      query: QUERY
    })
      .map(({ data }) => data).subscribe(
        (data: QueryResult) => {
          this.hypervisors = data.hypervisors.map(
            (h: IHypervisor) => new Hypervisor(h));

          this.build_graph_configs();
          this.compute_total();
        });
  }

  compute_total() {
    return this.hypervisors
      .filter((h: Hypervisor) => h.metadata.status === 'enabled')
      .reduce((acc: Hypervisor, curr: Hypervisor, idx: number) => {
        acc.cpus_total += curr.cpus_total;
        acc.vcpus_total += curr.vcpus_total;
        acc.vcpus_used += curr.vcpus_used;

        acc.running_vms += curr.running_vms;
        acc.workload += curr.workload;

        acc.ram_total += curr.ram_total;
        acc.memory_total += curr.memory_total;
        acc.memory_used += curr.memory_used;

        acc.disk_total += curr.disk_total;
        acc.disk_used += curr.disk_used;
        acc.disk_free += curr.disk_free;
        acc.disk_free_least += curr.disk_free_least;

        // moving average
        acc.load_5m = ((acc.load_5m * idx) + curr.load_5m) / (idx + 1);
        acc.load_10m = ((acc.load_10m * idx) + curr.load_10m) / (idx + 1);
        acc.load_15m = ((acc.load_15m * idx) + curr.load_15m) / (idx + 1);
      return acc;
      }, this.total);
  }

  graph_config: GraphConfig = <GraphConfig>({
    sets: [
      {
        label: "CPU",
        y_axis_label: "vcpus",

        series: [
          new GraphAggregateSeriesConfig({
            label: "Used VCPUs",
            ...Series.HYPERVISOR_VCPUS_USED,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
          new GraphAggregateSeriesConfig({
            label: "VCPUs",
            ...Series.HYPERVISOR_VCPUS_TOTAL,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
          new GraphAggregateSeriesConfig({
            label: "CPUs",
            ...Series.HYPERVISOR_CPUS_TOTAL,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
        ]
      },
      {
        label: "RAM",
        y_axis_label: "GB",

        series: [
          new GraphAggregateSeriesConfig({
            label: "Used VRAM",
            ...Series.HYPERVISOR_MEMORY_USED,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
          new GraphAggregateSeriesConfig({
            label: "VRAM",
            ...Series.HYPERVISOR_MEMORY_TOTAL,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
          new GraphAggregateSeriesConfig({
            label: "RAM",
            ...Series.HYPERVISOR_RAM_TOTAL,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
        ]
      },
      {
        label: "Instances",
        y_axis_label: "",

        series: [
          new GraphAggregateSeriesConfig({
            label: "Running",
            ...Series.HYPERVISOR_RUNNING_VMS,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
          new GraphAggregateSeriesConfig({
            label: "Workload",
            ...Series.HYPERVISOR_WORKLOAD,
            tag: {key: CAOS_HYPERVISOR_TAG_KEY},
            aggregate: "SUM"
          }),
        ]
      },
    ]
  });

  graph_config_for_hypervisor: { [key: string]: GraphConfig } = {};
  build_graph_configs() {
    for(let h of this.hypervisors) {
      let cfg = <GraphConfig>({
        sets: [
          {
            label: "CPU",
            y_axis_label: "vcpus",

            series: [
              new GraphAggregateSeriesConfig({
                label: "Used VCPUs",
                ...Series.HYPERVISOR_VCPUS_USED,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
              new GraphAggregateSeriesConfig({
                label: "VCPUs",
                ...Series.HYPERVISOR_VCPUS_TOTAL,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
              new GraphAggregateSeriesConfig({
                label: "CPUs",
                ...Series.HYPERVISOR_CPUS_TOTAL,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
            ]
          },
          {
            label: "RAM",
            y_axis_label: "GB",

            series: [
              new GraphAggregateSeriesConfig({
                label: "Used VRAM",
                ...Series.HYPERVISOR_MEMORY_USED,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
              new GraphAggregateSeriesConfig({
                label: "VRAM",
                ...Series.HYPERVISOR_MEMORY_TOTAL,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
              new GraphAggregateSeriesConfig({
                label: "RAM",
                ...Series.HYPERVISOR_RAM_TOTAL,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
            ]
          },
          {
            label: "Instances",
            y_axis_label: "",

            series: [
              new GraphAggregateSeriesConfig({
                label: "Running",
                ...Series.HYPERVISOR_RUNNING_VMS,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
              new GraphAggregateSeriesConfig({
                label: "Workload",
                ...Series.HYPERVISOR_WORKLOAD,
                tags: [{key: CAOS_HYPERVISOR_TAG_KEY, value: h.hostname}],
                aggregate: "SUM"
              }),
            ]
          },
        ]
      });

      this.graph_config_for_hypervisor[h.hostname] = cfg;
    }
  }
}
