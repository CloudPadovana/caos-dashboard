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
