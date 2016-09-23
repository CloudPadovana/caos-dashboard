import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ApiService, Metric } from '../api.service';

@Component({
  selector: 'metric-selector',
  templateUrl: 'components/metric-selector.component.html'
})
export class MetricSelectorComponent implements OnInit {
  metrics: Metric[] = [];

  _selection: Metric;

  @Output() selection_changed = new EventEmitter<Metric>();

  constructor(private _api: ApiService) { }

  ngOnInit() {
    this._api.metrics().subscribe(
      (metrics: Metric[]) => {
        this.metrics = metrics;
        this.metric_selected(metrics[0]);
      })
  }

  metric_selected(m: Metric): void {
    this._selection = m;
    this.selection_changed.emit(m);
  }

  is_selected(m: Metric): boolean {
    return this._selection == m;
  }
}
