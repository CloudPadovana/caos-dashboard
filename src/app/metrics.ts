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

export interface IMetric {
  name: string;
  label: string;
  unit: string;
  scale: number;
  value_formatter?(v: number): string;
  tick_formatter?(v: number): string;
}

export class Metric implements IMetric {
  name: string;
  label: string;
  unit: string;
  scale: number = 1;
  value_formatter = (v: number) => { return d3.format('.05s')(v) + ' ' + this.unit; };
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
  unit: "",
  scale: 1,
});

export const VM_CPU_TIME_USAGE = new Metric({
  name: "cpu",
  label: "CPU Time",
  unit: "hours",
  scale: 1/3600,
});

export const VM_WALLCLOCK_TIME_USAGE = new Metric({
  name: "wallclocktime",
  label: "Wall Clock Time",
  unit: "hours",
  scale: 1/3600,
});

export const VM_CPU_EFFICIENCY = new Metric({
  name: "cpu.efficiency",
  label: "CPU Efficiency",
  unit: "%",
  scale: 1,
  value_formatter: (v: number) => { return d3.format('.02%')(v); },
  tick_formatter: (v: number) => { return d3.format('.01%')(v); },
});

export const VM_VCPUS_USAGE = new Metric({
  name: "vm.vcpus.usage",
  label: "",
  unit: "hours",
  scale: 1/3600,
});

export const VM_DISK_USAGE = new Metric({
  name: "vm.disk.usage",
  label: "",
  unit: "TB",
  scale: 1/1e12,
});

export const VM_MEMORY_USAGE = new Metric({
  name: "vm.memory.usage",
  label: "",
  unit: "GB",
  scale: 1/1e9,
});

export const VM_COUNT_ACTIVE = new Metric({
  name: "vms.active",
  label: "",
  unit: "",
  scale: 1,
});

export const VM_COUNT_DELETED = new Metric({
  name: "vms.deleted",
  label: "",
  unit: "",
  scale: 1,
});

export const QUOTA_MEMORY = new Metric({
  name: "quota.memory",
  label: "",
  unit: "GB",
  scale: 1/1e9,
});

export const QUOTA_VCPUS = new Metric({
  name: "quota.vcpus",
  label: "VCPUs quota",
  unit: "vcpus",
  scale: 1,
});

export const QUOTA_CPUS = new Metric({
  name: "quota.cpus",
  label: "",
  unit: "cpus",
  scale: 1,
});

export const QUOTA_INSTANCES = new Metric({
  name: "quota.instances",
  label: "",
  unit: "",
  scale: 1,
});

export const HYPERVISOR_STATUS = new Metric({
  name: "hypervisor.status",
  label: "",
  unit: "",
  scale: 1,
});

export const HYPERVISOR_STATE = new Metric({
  name: "hypervisor.state",
  label: "",
  unit: "",
  scale: 1,
});

export const HYPERVISOR_CPUS_TOTAL = new Metric({
  name: "hypervisor.cpus.total",
  label: "",
  unit: "cpus",
  scale: 1,
});

export const HYPERVISOR_VCPUS_TOTAL = new Metric({
  name: "hypervisor.vcpus.total",
  label: "",
  unit: "vcpus",
  scale: 1,
});

export const HYPERVISOR_VCPUS_USED = new Metric({
  name: "hypervisor.vcpus.used",
  label: "",
  unit: "vcpus",
  scale: 1,
});

export const HYPERVISOR_RAM_TOTAL = new Metric({
  name: "hypervisor.ram.total",
  label: "",
  unit: "GB",
  scale: 1/1e9,
});

export const HYPERVISOR_MEMORY_TOTAL = new Metric({
  name: "hypervisor.memory.total",
  label: "",
  unit: "GB",
  scale: 1/1e9,
});

export const HYPERVISOR_MEMORY_USED = new Metric({
  name: "hypervisor.memory.used",
  label: "",
  unit: "GB",
  scale: 1/1e9,
});

export const HYPERVISOR_RUNNING_VMS = new Metric({
  name: "hypervisor.vms.running",
  label: "",
  unit: "vms",
  scale: 1,
});

export const HYPERVISOR_WORKLOAD = new Metric({
  name: "hypervisor.workload",
  label: "",
  unit: "",
  scale: 1,
});

export const HYPERVISOR_LOAD_5m = new Metric({
  name: "hypervisor.load.5m",
  label: "",
  unit: "%",
  scale: 1,
});

export const HYPERVISOR_LOAD_10m = new Metric({
  name: "hypervisor.load.10m",
  label: "",
  unit: "%",
  scale: 1,
});

export const HYPERVISOR_LOAD_15m = new Metric({
  name: "hypervisor.load.15m",
  label: "",
  unit: "%",
  scale: 1,
});

export const HYPERVISOR_DISK_TOTAL = new Metric({
  name: "hypervisor.disk.total",
  label: "",
  unit: "TB",
  scale: 1/1e12,
});

export const HYPERVISOR_DISK_USED = new Metric({
  name: "hypervisor.disk.used",
  label: "",
  unit: "TB",
  scale: 1/1e12,
});

export const HYPERVISOR_DISK_FREE = new Metric({
  name: "hypervisor.disk.free",
  label: "",
  unit: "TB",
  scale: 1/1e12,
});

export const HYPERVISOR_DISK_FREE_LEAST = new Metric({
  name: "hypervisor.disk.free.least",
  label: "",
  unit: "TB",
  scale: 1/1e12,
});
