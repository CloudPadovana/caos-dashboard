import { Component, OnInit, Input } from '@angular/core';

import { ApiService, Metric } from '../../api.service';
import { AccountingService } from '../accounting.service';

const LABELS: { [key: string] : string } = {
  "cpu": "CPU Usage",
  "wallclocktime": "Wall Clock Time",
}

@Component({
  selector: 'metric-selector',
  templateUrl: 'accounting/components/metric-selector.component.html'
})
export class MetricSelectorComponent implements OnInit {
  @Input() label: string;
  _selection: Metric;
  metrics: Metric[] = [];

  constructor(private _api: ApiService, private _accounting: AccountingService) { }

  ngOnInit() {
    this._api.metrics().subscribe(
      (metrics: Metric[]) => {
        this.metrics = metrics;
        this.metric_selected(metrics[0]);
      });
  }

  metric_selected(m: Metric): void {
    this._selection = m;
    this._accounting.metric = m;
  }

  is_selected(m: Metric): boolean {
    return this._selection == m;
  }

  metric_label(m: Metric): string {
    return LABELS[m.name] || m.name;
  }
}
