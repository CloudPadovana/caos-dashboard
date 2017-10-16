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

import * as Metrics from './metrics';

export const HYPERVISOR_CPUS_TOTAL = {
  metric: Metrics.HYPERVISOR_CPUS_TOTAL,
  period: 0,
  downsample: "AVG",
};

export const HYPERVISOR_VCPUS_TOTAL = {
  metric: Metrics.HYPERVISOR_VCPUS_TOTAL,
  period: 0,
  downsample: "AVG",
};

export const HYPERVISOR_VCPUS_USED = {
  metric: Metrics.HYPERVISOR_VCPUS_USED,
  period: 0,
  downsample: "AVG",
};

export const HYPERVISOR_RAM_TOTAL = {
  metric: Metrics.HYPERVISOR_RAM_TOTAL,
  period: 0,
  downsample: "AVG",
};

export const HYPERVISOR_MEMORY_TOTAL = {
  metric: Metrics.HYPERVISOR_MEMORY_TOTAL,
  period: 0,
  downsample: "AVG",
};

export const HYPERVISOR_MEMORY_USED = {
  metric: Metrics.HYPERVISOR_MEMORY_USED,
  period: 0,
  downsample: "AVG",
};


export const HYPERVISOR_RUNNING_VMS = {
  metric: Metrics.HYPERVISOR_RUNNING_VMS,
  period: 0,
  downsample: "AVG",
};

export const HYPERVISOR_WORKLOAD = {
  metric: Metrics.HYPERVISOR_WORKLOAD,
  period: 0,
  downsample: "AVG",
};
