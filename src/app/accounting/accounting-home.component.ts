import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';

import { ApiService, Project, DateRange } from '../api.service';


@Component({
  templateUrl: 'accounting/accounting-home.component.html'
})
export class AccountingHomeComponent implements OnInit {
  projects: Project[];
  daterange: DateRange;

  constructor(private _api: ApiService) { }

  ngOnInit() {
    let now = moment.utc();
    let end_date = now.toDate();
    let duration = moment.duration({days: 7});
    let start_date = now.subtract(duration).toDate();

    this.daterange = <DateRange>({
      start: start_date,
      end: end_date
    });

    this._api.projects().subscribe(
      (projects: Project[]) =>
        this.projects = projects);
  }
}
