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

import { AccountingService, DateRange } from './accounting.service';

@Component({
  templateUrl: 'accounting/accounting.component.html'
})
export class AccountingComponent implements OnInit, OnDestroy {
  daterange: DateRange;

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.daterange$
      .subscribe((d: DateRange) => this.daterange = d);
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
