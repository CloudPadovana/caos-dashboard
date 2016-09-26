import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface Metric {
  label: string;
  name: string;
}

const METRICS: Metric[] = [
    <Metric>({label: "CPU Usage",
              name: "cpu"}),
    <Metric>({label: "Wall Clock Time",
              name: "wallclocktime"}),
]

@Component({
  selector: 'metric-selector',
  templateUrl: 'components/metric-selector.component.html'
})
export class MetricSelectorComponent implements OnInit {
  @Input() label: string;

  readonly metrics: Metric[] = METRICS;
  _selection: Metric;

  @Output() selection_changed = new EventEmitter<Metric>();

  constructor() { }

  ngOnInit() {
    this.metric_selected(this.metrics[0]);
  }

  metric_selected(m: Metric): void {
    this._selection = m;
    this.selection_changed.emit(m);
  }

  is_selected(m: Metric): boolean {
    return this._selection == m;
  }
}
