import { Component, OnInit } from '@angular/core';
import { ApiService, Project, Period } from './api.service';
import { DateRange } from './range.component';

import * as moment from 'moment';


@Component({
  selector: 'accounting',
  providers: [ ApiService ],
  templateUrl: 'templates/accounting.html'
})
export class AccountingComponent implements OnInit {
  project: Project;
  projects: Project[];

  period: Period;
  periods: Period[];

  range: DateRange;

  constructor(private _api: ApiService) {
  }

  ngOnInit() {
    this._api.projects().subscribe(
      (p: Project[]) => this.projects = p,
      error => console.log("Error happened fetching projects: " + error),
      () => {
        if(this.projects) {
          this.project_selected(this.projects[0]);
        }}
    );

    this.periods = this._api.periods();
    this.period_selected(this.periods[1]);
  }

  period_selected(p: Period): void {
    this.period = p;
  }

  project_selected(p: Project): void {
    this.project = p;
  }

  range_selected(r: DateRange): void {
    this.range = r;
  }
}
