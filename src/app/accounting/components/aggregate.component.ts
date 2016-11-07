import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService } from '../accounting.service';

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
  <ng-content></ng-content>
</div>
`
})
export class AggregateComponent implements OnInit, OnDestroy {
  fetching: number;

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.fetching_data$
      .subscribe((percent: number) => this.fetching = percent)
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
