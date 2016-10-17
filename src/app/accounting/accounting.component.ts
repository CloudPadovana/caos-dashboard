import { Component } from '@angular/core';

import { Project, Metric, DateRange } from '../api.service';

@Component({
  templateUrl: 'accounting/accounting.component.html'
})
export class AccountingComponent {
  projects: Project[];
  metric: Metric;
  daterange: DateRange;
  granularity: number;
}
