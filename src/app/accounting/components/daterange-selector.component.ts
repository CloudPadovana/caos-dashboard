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

import { AccountingService, DateRange, PresetDuration } from '../accounting.service';

const PRESETS: PresetDuration[] = [
    <PresetDuration>({label: "day",
                      duration: {days: 1}}),

    <PresetDuration>({label: "week",
                      duration: {weeks: 1}}),

    <PresetDuration>({label: "month",
                      duration: {months: 1}}),

    <PresetDuration>({label: "3 months",
                      duration: {months: 3}}),

    <PresetDuration>({label: "year",
                      duration: {years: 1}}),
]

@Component({
  selector: 'daterange-selector',
  templateUrl: 'accounting/components/daterange-selector.component.html'
})
export class DateRangeSelectorComponent implements OnInit {
  private _daterange_start: Date;
  @Input()
  set daterange_start(d: Date) {
    let new_d: Date = this.strip_time(d);

    // NOTE: This is a workaround to avoid multiple fires from datepicker
    if (!moment(new_d).isSame(this._daterange_start)) {
      this._daterange_start = new_d;
      this.emit_daterange();
    }
  }

  get daterange_start(): Date {
    return this._daterange_start;
  }

  private _daterange_end: Date;
  @Input()
  set daterange_end(d: Date) {
    let new_d: Date = this.strip_time(d);

    // NOTE: This is a workaround to avoid multiple fires from datepicker
    if (!moment(new_d).isSame(this._daterange_end)) {
      this._daterange_end = new_d;
      this.emit_daterange();
    }
  }

  get daterange_end(): Date {
    return this._daterange_end;
  }

  readonly presets = PRESETS;

  constructor(private _accounting: AccountingService) { }

  ngOnInit() {
    this.preset_clicked(PRESETS[1]);
  }

  is_selected(r: PresetDuration): boolean {
    let d = this.daterange_from_preset(r);
    return ((moment(d.start).isSame(this.daterange_start)) &&
            (moment(d.end).isSame(this.daterange_end)));
  }

  private strip_time(d: Date): Date {
    return moment(d)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0).toDate();
  }

  private emit_daterange(): void {
    let d_end: Date = moment(this.daterange_end).add(1, 'd').toDate();

    let r = <DateRange>({
      start: this.daterange_start,
      end: d_end
    });
    this._accounting.daterange = r;
  }

  private daterange_from_preset(r: PresetDuration): DateRange {
    let now = moment()
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    let duration = moment.duration(r.duration);
    let end = now.toDate();
    let start = now.subtract(duration).toDate();
    return <DateRange>({
      start: start,
      end: end
    });
  }

  preset_clicked(r: PresetDuration): void {
    let d = this.daterange_from_preset(r);
    this.daterange_start = d.start;
    this.daterange_end = d.end;
  };
}
