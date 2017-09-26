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

import * as d3 from 'd3';
import * as mathjs from 'mathjs';

export interface IMetric {
  name: string;
  label: string;
  raw_unit: string;
  display_unit: string;
  scale?: number;
  scale_value?(v: number): number;
  value_formatter?(v: number): string;
  tick_formatter?(v: number): string;
}

export class Metric implements IMetric {
  name: string;
  label: string;
  raw_unit: string;
  display_unit: string;
  scale?: number;

  scale_value = (v: number) => {
    if (this.scale) {
      return v * this.scale;
    } else {
      return mathjs.unit(v, this.raw_unit).toNumber(this.display_unit);
    }
  };

  value_formatter = (v: number) => { return d3.format('.05s')(v) + ' ' + this.display_unit; };
  tick_formatter = (v: number) => { return d3.format('.02s')(v); };

  constructor(kwargs?: IMetric) {
    if(kwargs) {
      return (<any>Object).assign(this, kwargs);
    }
  }
}

export const IDENTITY = new Metric({
  name: "",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const VM_CPU_TIME_USAGE = new Metric({
  name: "cpu",
  label: "CPU Time",
  raw_unit: "s",
  display_unit: "h",
});

export const VM_WALLCLOCK_TIME_USAGE = new Metric({
  name: "wallclocktime",
  label: "Wall Clock Time",
  raw_unit: "s",
  display_unit: "h",
});

export const VM_CPU_EFFICIENCY = new Metric({
  name: "cpu.efficiency",
  label: "CPU Efficiency",
  raw_unit: "%",
  display_unit: "%",
  scale: 1,
  value_formatter: (v: number) => { return d3.format('.02%')(v); },
  tick_formatter: (v: number) => { return d3.format('.01%')(v); },
});

export const VM_VCPUS_USAGE = new Metric({
  name: "vm.vcpus.usage",
  label: "",
  raw_unit: "s",
  display_unit: "h",
});

export const VM_DISK_USAGE = new Metric({
  name: "vm.disk.usage",
  label: "",
  raw_unit: "B",
  display_unit: "TB",
});

export const VM_MEMORY_USAGE = new Metric({
  name: "vm.memory.usage",
  label: "",
  raw_unit: "B",
  display_unit: "GB",
});

export const VM_COUNT_ACTIVE = new Metric({
  name: "vms.active",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const VM_COUNT_DELETED = new Metric({
  name: "vms.deleted",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const QUOTA_MEMORY = new Metric({
  name: "quota.memory",
  label: "",
  raw_unit: "B",
  display_unit: "GB",
});

export const QUOTA_VCPUS = new Metric({
  name: "quota.vcpus",
  label: "VCPUs quota",
  raw_unit: "vcpus",
  display_unit: "vcpus",
  scale: 1,
});

export const QUOTA_CPUS = new Metric({
  name: "quota.cpus",
  label: "",
  raw_unit: "cpus",
  display_unit: "cpus",
  scale: 1,
});

export const QUOTA_INSTANCES = new Metric({
  name: "quota.instances",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const HYPERVISOR_STATUS = new Metric({
  name: "hypervisor.status",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const HYPERVISOR_STATE = new Metric({
  name: "hypervisor.state",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const HYPERVISOR_CPUS_TOTAL = new Metric({
  name: "hypervisor.cpus.total",
  label: "",
  raw_unit: "cpus",
  display_unit: "cpus",
  scale: 1,
});

export const HYPERVISOR_VCPUS_TOTAL = new Metric({
  name: "hypervisor.vcpus.total",
  label: "",
  raw_unit: "vcpus",
  display_unit: "vcpus",
  scale: 1,
});

export const HYPERVISOR_VCPUS_USED = new Metric({
  name: "hypervisor.vcpus.used",
  label: "",
  raw_unit: "vcpus",
  display_unit: "vcpus",
  scale: 1,
});

export const HYPERVISOR_RAM_TOTAL = new Metric({
  name: "hypervisor.ram.total",
  label: "",
  raw_unit: "B",
  display_unit: "GB",
});

export const HYPERVISOR_MEMORY_TOTAL = new Metric({
  name: "hypervisor.memory.total",
  label: "",
  raw_unit: "B",
  display_unit: "GB",
});

export const HYPERVISOR_MEMORY_USED = new Metric({
  name: "hypervisor.memory.used",
  label: "",
  raw_unit: "B",
  display_unit: "GB",
});

export const HYPERVISOR_RUNNING_VMS = new Metric({
  name: "hypervisor.vms.running",
  label: "",
  raw_unit: "vms",
  display_unit: "vms",
  scale: 1,
});

export const HYPERVISOR_WORKLOAD = new Metric({
  name: "hypervisor.workload",
  label: "",
  raw_unit: "",
  display_unit: "",
  scale: 1,
});

export const HYPERVISOR_LOAD_5m = new Metric({
  name: "hypervisor.load.5m",
  label: "",
  raw_unit: "%",
  display_unit: "%",
  scale: 1,
});

export const HYPERVISOR_LOAD_10m = new Metric({
  name: "hypervisor.load.10m",
  label: "",
  raw_unit: "%",
  display_unit: "%",
  scale: 1,
});

export const HYPERVISOR_LOAD_15m = new Metric({
  name: "hypervisor.load.15m",
  label: "",
  raw_unit: "%",
  display_unit: "%",
  scale: 1,
});

export const HYPERVISOR_DISK_TOTAL = new Metric({
  name: "hypervisor.disk.total",
  label: "",
  raw_unit: "B",
  display_unit: "TB",
});

export const HYPERVISOR_DISK_USED = new Metric({
  name: "hypervisor.disk.used",
  label: "",
  raw_unit: "B",
  display_unit: "TB",
});

export const HYPERVISOR_DISK_FREE = new Metric({
  name: "hypervisor.disk.free",
  label: "",
  raw_unit: "B",
  display_unit: "TB",
});

export const HYPERVISOR_DISK_FREE_LEAST = new Metric({
  name: "hypervisor.disk.free.least",
  label: "",
  raw_unit: "B",
  display_unit: "TB",
});
