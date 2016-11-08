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

          if(this._sorting_field) {
            // If we were sorting, resort the data
            this.sort(this._sorting_field, this._sorting_ascending);
          }
        });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  _sorting_field: string;
  _sorting_ascending: boolean;

  is_sorting(field: string, ascending: boolean) {
    return this._sorting_field === field && this._sorting_ascending == ascending;
  }

  sort(field: string, ascending: boolean) {
    this._sorting_field = field;
    this._sorting_ascending = ascending;

    this.data.sort((r1: Row, r2: Row) => {
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
