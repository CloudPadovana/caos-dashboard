import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Project, Aggregate, ProjectAggregate } from '../accounting.service';
import { OVERALL_PROJECT } from '../accounting.service';

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
  data: Row[] = [];

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.data$
      .subscribe(
        (pas: ProjectAggregate[]) => {
          let data = pas.map(
            (pa: ProjectAggregate) => <Row>({
              project: pa.project,
              value: pa.values
                .map((a: Aggregate) => a.sum)
                .reduce((acc, cur) => acc + cur, 0)
            }));

          let s = data.find((r: Row) => r.project == OVERALL_PROJECT);
          this.data = data.map((d: Row) => {
            d.percent = d.value / s.value;
            return d;
          });
        });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
