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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Data } from '../accounting.service';

@Component({
  selector: 'aggregate',
  template: `
<div *ngIf="fetching">
  <div class="row">
    <div class="col-sm-2"></div>
    <div class="col-sm-8">Loading data: {{ fetching | percent }}
      <progress class="progress" [value]="fetching" max="1"></progress>
    </div>
  </div>
</div>
<div *ngIf="!fetching">
  <div *ngIf="!has_data">
    <div class="alert alert-warning" role="alert">
      <h4 class="alert-heading">No data available!</h4>
      <p>No data available for the given parameters.</p>
    </div>
  </div>
  <div *ngIf="has_data">
    <ng-content></ng-content>
  </div>
</div>
`
})
export class AggregateComponent implements OnInit, OnDestroy {
  fetching: number;
  has_data: boolean = false;

  _subscriptions: Subscription[];
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscriptions = [];
    this._subscriptions.push(this._accounting.fetching_data$.subscribe((percent: number) => this.fetching = percent));
    this._subscriptions.push(this._accounting.data$.subscribe((d: Data) => {
      if(!d || !d.overall || !d.overall.values.length) {
        this.has_data = false;
      } else {
        this.has_data = true;
      }
    }));
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s: Subscription) => s.unsubscribe());
  }
}
