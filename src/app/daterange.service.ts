////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2018 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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

import { Injectable, EventEmitter } from '@angular/core';

export interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class DateRangeService {
  private _range: DateRange;
  range_changed: EventEmitter<DateRange> = new EventEmitter<DateRange>(null);

  get range(): DateRange {
    return this._range;
  }

  set range(r: DateRange) {
    this._range = r;
    this.range_changed.next(r);
  }

  constructor() { }

}
