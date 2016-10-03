import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';

interface Granularity {
  label: string;
  duration: moment.MomentInput;
}

const GRANULARITIES: Granularity[] = [
    <Granularity>({label: "1 hour",
                   duration: {hours: 1}}),
    <Granularity>({label: "1 day",
                   duration: {days: 1}}),
    <Granularity>({label: "1 week",
                   duration: {days: 7}}),
]

@Component({
  selector: 'granularity-selector',
  templateUrl: 'components/granularity-selector.component.html'
})
export class GranularitySelectorComponent implements OnInit {
  @Input() label: string;

  _selection: Granularity;
  readonly granularities = GRANULARITIES;

  @Output() selection_changed = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    this.granularity_selected(this.granularities[1]);
  }

  granularity_selected(g: Granularity): void {
    this._selection = g;
    let s = moment.duration(g.duration).asSeconds();
    this.selection_changed.emit(s);
  }

  is_selected(g: Granularity): boolean {
    return this._selection == g;
  }
}
