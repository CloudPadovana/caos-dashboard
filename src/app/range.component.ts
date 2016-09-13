import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

export interface DateRange {
  start: Date;
  end: Date;
}

interface PresetRange {
  label: string;
  duration: moment.MomentInput;
}

const PRESET_RANGES: PresetRange[] = [
    <PresetRange>({label: "day",
                   duration: {days: 1}}),

    <PresetRange>({label: "week",
                   duration: {weeks: 1}}),

    <PresetRange>({label: "month",
                   duration: {months: 1}}),

    <PresetRange>({label: "3 months",
                   duration: {months: 3}}),

    <PresetRange>({label: "year",
                   duration: {years: 1}}),
]

@Component({
  selector: 'range',
  templateUrl: 'range.component.html'
})
export class RangeComponent implements OnInit {
  @Output() range_selected = new EventEmitter();

  readonly preset_ranges = PRESET_RANGES;

  range: DateRange;
  private start_date: Date;
  private end_date: Date;

  collapsed: boolean = true;
  constructor() { }

  ngOnInit() {
    this.preset_range_clicked(PRESET_RANGES[2]);
    this.apply();
  }

  apply() {
    let r = <DateRange>({
      start: this.start_date,
      end: this.end_date
    });
    this.range = r;
    this.range_selected.emit(r);
    this.collapsed = true;
  }

  reset() {
    this.start_date = this.range.start;
    this.end_date = this.range.end;
  }

  preset_range_clicked(r: PresetRange): void {
    let now = moment.utc();
    this.end_date = now.toDate();
    let duration = moment.duration(r.duration);
    this.start_date = now.subtract(duration).toDate();
  };

}
