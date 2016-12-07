////////////////////////////////////////////////////////////////////////////////
//
// caos-frontend - CAOS frontend
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Project, Aggregate, ProjectAggregate, Data } from '../accounting.service';

interface Row {
  project: Project;
  value: number;
  percent: number;
}

@Component({
  selector: 'aggregate-table',
  templateUrl: 'accounting/components/aggregate-table.component.html'
})
export class AggregateTableComponent implements OnInit, OnDestroy {
  rows: Row[] = [];
  overall: Row;

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.data$.subscribe((data: Data) => {
      if(!data) { return; }
      this.update(data);
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  get table_enabled(): boolean {
    if(!this._accounting.metric) { return false }

    let m = this._accounting.metric;
    if(m.name === 'efficiency') { return false }
    return true;
  }

  update(d: Data) {
    // this can be 0, so that percent could be NaN
    let overall_value = d.overall.aggregate.sum;

    let overall = <Row>({
      project: d.overall.project,
      value: overall_value,
      percent: overall_value / overall_value
    });
    this.overall = overall;

    this.rows = d.aggregates.map((pa: ProjectAggregate) => {
      let value = pa.aggregate.sum || 0;

      return <Row>({
        project: pa.project,
        value: value,
        percent: value / overall.value
      });
    });

    if(this._sorting_field) {
      // If we were sorting, resort the data
      this.sort(this._sorting_field, this._sorting_ascending);
    }
  }

  _sorting_field: string;
  _sorting_ascending: boolean;

  is_sorting(field: string, ascending: boolean) {
    return this._sorting_field === field && this._sorting_ascending == ascending;
  }

  sort(field: string, ascending: boolean) {
    this._sorting_field = field;
    this._sorting_ascending = ascending;

    this.rows.sort((r1: Row, r2: Row) => {
      let v1 = this.deep_get(r1, field);
      let v2 = this.deep_get(r2, field);

      let sign = ascending ? +1 : -1;
      if (v1 > v2) { return sign * +1; }
      if (v1 < v2) { return sign * -1; }
      return 0;
    });
  }

  deep_get(r: Row, field: string) {
    let cur = r;
    let split = field.split('.');

    for(let s of split) {
      cur = (<any>cur)[s];
    }

    return cur;
  }
}
