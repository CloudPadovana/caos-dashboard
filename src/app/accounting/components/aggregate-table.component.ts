import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Project, Aggregate, ProjectAggregate } from '../accounting.service';

interface Row {
  project: Project;
  value: number;
}

@Component({
  selector: 'aggregate-table',
  templateUrl: 'accounting/components/aggregate-table.component.html'
})
export class AggregateTableComponent implements OnInit, OnDestroy {
  data: Row[] = [];

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.data$
      .subscribe(
        (pas: ProjectAggregate[]) => {
          this.data = pas.map(
            (pa: ProjectAggregate) => <Row>({
              project: pa.project,
              value: pa.values
                .map((a: Aggregate) => a.sum)
                .reduce((acc, cur) => acc + cur, 0)
            }));
        });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
