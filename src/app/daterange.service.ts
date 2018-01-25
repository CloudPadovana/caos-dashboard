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
import * as moment from 'moment';

export interface DateRange {
  start: Date;
  end: Date;
}

export function describe_date(d: Date): string {
  if(!d) { return "" }

  return moment(d).format("YYYY/MM/DD HH:mm");
}

export function is_daterange_same(d1: DateRange, d2: DateRange): boolean {
  return ((moment(d1.start).isSame(d2.start)) &&
          (moment(d1.end).isSame(d2.end)));
}

export interface DurationPreset {
  label: string;
  duration: moment.DurationInputObject;
}

export interface DateRangePreset extends DurationPreset {
  // aurgument to moment.startOf()
  starting: moment.unitOfTime.StartOf;

  // how much to go back in time
  backward: moment.DurationInputObject;
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
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

export function daterange_from_preset(r: DateRangePreset): DateRange {
  let now = moment()
    .minute(0)
    .second(0)
    .millisecond(0);

  let backward = r.backward;
  let starting = r.starting;

  // Week starts on Monday!!!
  if(starting == 'week') {
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

export function is_daterange_same_preset(r: DateRange, p: DateRangePreset): boolean {
  if(!r) { return false };
  let d = daterange_from_preset(p);
  return is_daterange_same(d, r);
}

export function describe_daterange(d: DateRange): string {
  if(!d) { return "" }

  // Check for presets
  for(let p of DATE_RANGE_PRESETS) {
    if(is_daterange_same_preset(d, p)) {
      return p.label;
    }
  }

  let d1 = describe_date(d.start);
  let d2 = describe_date(d.end);

  return `From ${d1} to ${d2}`;
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

  constructor() {
    this.range = daterange_from_preset(DATE_RANGE_PRESETS[0]);
  }
}
