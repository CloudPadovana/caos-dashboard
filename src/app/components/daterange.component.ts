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

import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as moment from 'moment';

import { DateRange, DateRangeService } from '../daterange.service';
export { DateRange };

export interface DurationPreset {
  label: string;
  duration: moment.DurationInputObject;
}

interface DateRangePreset extends DurationPreset {
  // aurgument to moment.startOf()
  starting: moment.unitOfTime.StartOf;

  // how much to go back in time
  backward: moment.DurationInputObject;
}

const PRESETS: DateRangePreset[] = [
    <DateRangePreset>({label: "today",
                       starting: 'day',
                       backward: {days: 0},
                       duration: {days: 1}}),

    <DateRangePreset>({label: "past 24h",
                       starting: 'hour',
                       backward: {days: 1},
                       duration: {days: 1}}),

    <DateRangePreset>({label: "yesterday",
                       starting: 'day',
                       backward: {days: 1},
                       duration: {days: 1}}),

    <DateRangePreset>({label: "current week",
                       starting: 'week',
                       backward: {weeks: 0},
                       duration: {weeks: 1}}),

    <DateRangePreset>({label: "last week",
                       starting: 'day',
                       backward: {weeks: 1},
                       duration: {weeks: 1}}),

    <DateRangePreset>({label: "current month",
                       starting: 'month',
                       backward: {months: 0},
                       duration: {months: 1}}),

    <DateRangePreset>({label: "last month",
                       starting: 'day',
                       backward: {months: 1},
                       duration: {months: 1}}),

    <DateRangePreset>({label: "last 3 months",
                       starting: 'day',
                       backward: {months: 3},
                       duration: {months: 3}}),

    <DateRangePreset>({label: "current year",
                       starting: 'year',
                       backward: {years: 0},
                       duration: {years: 1}}),
]

@Component({
  selector: 'daterange',
  templateUrl: 'daterange.component.html'
})
export class DateRangeComponent implements OnInit {
  private start_date: Date;
  private end_date: Date;

  readonly presets = PRESETS;

  get range(): DateRange {
    return this._daterange.range;
  }

  constructor(private _daterange: DateRangeService) { }

  ngOnInit() {
    if(!this.range) {
      this._daterange.range = this.daterange_from_preset(PRESETS[0]);
    }
  }

  is_daterange_same(d1: DateRange, d2: DateRange): boolean {
    return ((moment(d1.start).isSame(d2.start)) &&
            (moment(d1.end).isSame(d2.end)));
  }

  is_selected(p: DateRangePreset, r: DateRange): boolean {
    if(!r) { return false };

    let d = this.daterange_from_preset(p);

    return this.is_daterange_same(d, r);
  }

  describe_daterange(d: DateRange): string {
    if(!d) { return "" }

    // Check for presets
    for(let p of this.presets) {
      if(this.is_selected(p, d)) {
        return p.label;
      }
    }

    let d1 = this.describe_date(d.start);
    let d2 = this.describe_date(d.end);

    return `From ${d1} to ${d2}`;
  }

  private describe_date(d: Date): string {
    if(!d) { return "" }

    return moment(d).format("YYYY/MM/DD HH:mm");
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

  private daterange_from_preset(r: DateRangePreset): DateRange {
    let now = moment()
      .minute(0)
      .second(0)
      .millisecond(0);

    let backward = r.backward;
    let starting = r.starting;

    // Week starts on Monday!!!
    if(r.starting == 'week') {
      starting = 'isoWeek';
    }

    let start = now.clone()
      .subtract(backward)
      .startOf(starting);

    let end = start.clone()
      .add(r.duration);

    return <DateRange>({
      start: start.toDate(),
      end: end.toDate()
    });
  }

  select_preset(r: DateRangePreset): void {
    this.daterange = this.daterange_from_preset(r);
  };

  ok_clicked() {
    this._daterange.range = this.daterange;
  }

  cancel_clicked() {
    this.daterange = this.range;
  }
}
