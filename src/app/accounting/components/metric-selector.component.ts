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
