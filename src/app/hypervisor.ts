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

import moment from 'moment';

export const CAOS_HYPERVISOR_TAG_KEY = "hypervisor";

export interface IHypervisor {
  hostname: string;

  metadata: {
    last_updated: Date;

    type: string;

    status: string;
    state: string;
    cores: number;
    ip: string;

    disabled_reason: string;
  }
}

export class Hypervisor implements IHypervisor {
  hostname: string;

  metadata: {
    last_updated: Date;

    type: string;

    status: string;
    state: string;
    cores: number;
    ip: string;

    disabled_reason: string;
  }

  constructor(kwargs?: IHypervisor) {
    if(kwargs) {
      return Object.assign(this, kwargs);
    }
  }

  get last_updated(): string {
    return moment(this.metadata.last_updated).fromNow();
  }
}
