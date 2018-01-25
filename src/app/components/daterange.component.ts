////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2017, 2018 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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

import { Component } from '@angular/core';
import * as moment from 'moment';

import {
  DateRange,
  DateRangeService,

  DateRangePreset,
  DATE_RANGE_PRESETS,

  daterange_from_preset,
  describe_daterange,
  is_daterange_same,
  is_daterange_same_preset,
} from '../daterange.service';
export { DateRange };

import { LocaleSettings } from 'primeng/primeng';

@Component({
  selector: 'daterange',
  templateUrl: 'daterange.component.html'
})
export class DateRangeComponent {
  locale: LocaleSettings = {
    firstDayOfWeek: 1,
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"],
    monthNames: [ "January","February","March","April","May","June","July","August","September","October","November","December" ],
    monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
    today: 'Today',
    clear: 'Clear'
  };

  private _current_daterange: DateRange = daterange_from_preset(DATE_RANGE_PRESETS[0]);

  get start_date(): Date { return this._current_daterange.start; }
  set start_date(d: Date) { this._current_daterange.start = d; }
  get end_date(): Date { return this._current_daterange.end; }
  set end_date(d: Date) { this._current_daterange.end = d; }

  readonly presets = DATE_RANGE_PRESETS;

  get range(): DateRange {
    return this._daterange.range;
  }

  constructor(private _daterange: DateRangeService) {
    _daterange.range_changed.subscribe(
      (d: DateRange) => this._current_daterange = d);
  }

  is_selected(p: DateRangePreset, r: DateRange): boolean {
    return is_daterange_same_preset(r, p);
  }

  describe_daterange(d: DateRange): string {
    return describe_daterange(d);
  }

  private get daterange(): DateRange {
    return <DateRange>({
      start: moment(this.start_date).toDate(),
      end: moment(this.end_date).toDate(),
    });
  }

  private set daterange(r: DateRange) {
    this.start_date = moment(r.start).toDate();
    this.end_date = moment(r.end).toDate();
  }

  select_preset(r: DateRangePreset): void {
    this.daterange = daterange_from_preset(r);
  };

  ok_clicked() {
    this._daterange.range = this.daterange;
  }

  cancel_clicked() {
    this.daterange = this.range;
  }
}
