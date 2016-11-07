import { Component } from '@angular/core';

import { Project, Aggregate } from '../../api.service';

import { AggregateData } from './aggregate.component';

interface TableRow {
  project: Project;
  value: number;
}

@Component({
  selector: 'aggregate-table',
  templateUrl: 'accounting/components/aggregate-table.component.html'
})
export class AggregateTableComponent {
  data: TableRow[] = [];

  update(data: AggregateData[]) {
    this.data = data.map((a: AggregateData) => <TableRow>({
      project: a.project,
      value: a.values
        .map((a: Aggregate) => a.sum)
        .reduce((acc, cur) => acc + cur, 0)
    }));
  }
}
