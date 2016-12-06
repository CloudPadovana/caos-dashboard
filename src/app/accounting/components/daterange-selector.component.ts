////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
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

import { Component } from '@angular/core';
import moment from 'moment';

import { AccountingService, DateRange, PresetDuration as PresetDurationOnly } from '../accounting.service';

interface PresetDuration extends PresetDurationOnly {
  // aurgument to moment.startOf()
  starting: moment.unitOfTime.StartOf;

  // how much to go back in time
  backward: moment.MomentInput;
}

const PRESETS: PresetDuration[] = [
    <PresetDuration>({label: "today",
                      starting: 'day',
                      backward: {days: 0},
                      duration: {days: 1}}),

    <PresetDuration>({label: "past 24h",
                      starting: 'hour',
                      backward: {days: 1},
                      duration: {days: 1}}),

    <PresetDuration>({label: "yesterday",
                      starting: 'day',
                      backward: {days: 1},
                      duration: {days: 1}}),

    <PresetDuration>({label: "current week",
                      starting: 'week',
                      backward: {weeks: 0},
                      duration: {weeks: 1}}),

    <PresetDuration>({label: "last week",
                      starting: 'day',
                      backward: {weeks: 1},
                      duration: {weeks: 1}}),

    <PresetDuration>({label: "current month",
                      starting: 'month',
                      backward: {months: 0},
                      duration: {months: 1}}),

    <PresetDuration>({label: "last month",
                      starting: 'day',
                      backward: {months: 1},
                      duration: {months: 1}}),

    <PresetDuration>({label: "last 3 months",
                      starting: 'day',
                      backward: {months: 3},
                      duration: {months: 3}}),

    <PresetDuration>({label: "current year",
                      starting: 'year',
                      backward: {years: 0},
                      duration: {years: 1}}),
]

@Component({
  selector: 'daterange-selector',
  templateUrl: 'accounting/components/daterange-selector.component.html'
})
export class DateRangeSelectorComponent {
  private start_date: Date;
  private end_date: Date;

  // minutes since midnight
  private start_time: number;
  private end_time: number;

  readonly presets = PRESETS;

  constructor(private _accounting: AccountingService) {
    this.preset_clicked(PRESETS[0]);
    this.emit_daterange();
  }

  is_daterange_same(d1: DateRange, d2: DateRange): boolean {
    return ((moment(d1.start).isSame(d2.start)) &&
            (moment(d1.end).isSame(d2.end)));
  }

  is_selected(r: PresetDuration): boolean {
    let d = this.daterange_from_preset(r);
    let c = this.daterange;

    return this.is_daterange_same(d, c);
  }

  is_global_selected(r: PresetDuration): boolean {
    let d = this.daterange_from_preset(r);
    let c = this.global_daterange;

    return this.is_daterange_same(d, c);
  }

  private get global_daterange(): DateRange {
    return this._accounting.daterange;
  }

  private get global_daterange_label(): string {
    for(let r of this.presets) {
      if(this.is_global_selected(r)) {
        return r.label;
      }
    }
    return "Custom";
  }

  private emit_daterange(): void {
    let r = this.daterange;
    this._accounting.daterange = r;
  }

  private get daterange(): DateRange {
    let start = moment(this.start_date)
      .clone()
      .minutes(this.start_time)
      .toDate();

    let end = moment(this.end_date)
      .clone()
      .minutes(this.end_time)
      .toDate();

    return <DateRange>({
      start: start,
      end: end
    });
  }

  private set daterange(r: DateRange) {
    let start = r.start;
    let end = r.end;

    this.start_date = moment(start).hours(0).minutes(0).toDate();
    this.end_date = moment(end).hours(0).minutes(0).toDate();

    this.start_time = moment(start).hours()*60 + moment(start).minutes();
    this.end_time = moment(end).hours()*60 + moment(end).minutes();
  }

  private daterange_from_preset(r: PresetDuration): DateRange {
    let now = moment()
      .clone()
      .minute(0)
      .second(0)
      .millisecond(0);

    let backward = r.backward;
    let starting = r.starting;

    // Week starts on Monday!!!
    if(r.starting == 'week') {
      starting = 'isoWeek';
    }

    let start = now
      .clone()
      .subtract(backward)
      .startOf(starting);

    let end = start
      .clone()
      .add(r.duration);

    return <DateRange>({
      start: start.toDate(),
      end: end.toDate()
    });
  }

  preset_clicked(r: PresetDuration): void {
    this.daterange = this.daterange_from_preset(r);
  };

  ok_clicked() {
    this.emit_daterange();
  }

  cancel_clicked() {
    this.daterange = this.global_daterange;
  }
}
