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
