import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import moment from 'moment';

import { DateRange } from '../api.service';

interface PresetDuration {
  label: string;
  duration: moment.MomentInput;
}

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
  templateUrl: 'components/daterange-selector.component.html'
})
export class DateRangeSelectorComponent implements OnInit {
  private _daterange_start: Date;
  @Input()
  set daterange_start(d: Date) {
    this._daterange_start = this.strip_time(d);
    this.emit_daterange();
  }

  get daterange_start(): Date {
    return this._daterange_start;
  }

  private _daterange_end: Date;
  @Input()
  set daterange_end(d: Date) {
    this._daterange_end = this.strip_time(d);
    this.emit_daterange();
  }

  get daterange_end(): Date {
    return this._daterange_end;
  }

  @Output() selection_changed = new EventEmitter<DateRange>();

  readonly presets = PRESETS;

  constructor() { }

  ngOnInit() {
    this.preset_clicked(PRESETS[2]);
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
    this.selection_changed.emit(r);
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
