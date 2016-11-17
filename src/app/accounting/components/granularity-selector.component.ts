////////////////////////////////////////////////////////////////////////////////
//
// caos-frontend - CAOS frontend
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

import { Component, OnInit, Input } from '@angular/core';
import moment from 'moment';

import { AccountingService, Granularity, PresetDuration } from '../accounting.service';

const PRESETS: PresetDuration[] = [
    <PresetDuration>({label: "1 hour",
                      duration: {hours: 1}}),

    <PresetDuration>({label: "1 day",
                      duration: {days: 1}}),

    <PresetDuration>({label: "1 week",
                      duration: {days: 7}}),
]

@Component({
  selector: 'granularity-selector',
  templateUrl: 'accounting/components/granularity-selector.component.html'
})
export class GranularitySelectorComponent implements OnInit {
  @Input() label: string;

  _selection: Granularity;
  readonly presets = PRESETS;

  constructor(private _accounting: AccountingService) { }

  ngOnInit() {
    this.preset_clicked(PRESETS[1]);
  }

  private granularity_from_preset(r: PresetDuration): Granularity {
    let s = moment.duration(r.duration).asSeconds();
    return s;
  }

  preset_clicked(r: PresetDuration): void {
    let g = this.granularity_from_preset(r);
    this._selection = g;
    this._accounting.granularity = g;
  }

  is_selected(r: PresetDuration): boolean {
    let g = this.granularity_from_preset(r);
    return this._selection == g;
  }
}
