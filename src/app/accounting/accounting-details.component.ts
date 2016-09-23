import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import * as moment from 'moment';

import { ApiService, Project, Metric, DateRange } from '../api.service';


@Component({
  templateUrl: 'accounting/accounting-details.component.html'
})
export class AccountingDetailsComponent implements OnInit {
  project: Project;
  metric: Metric;
  daterange: DateRange;

  constructor(private _route: ActivatedRoute,
              private _api: ApiService) { }

  ngOnInit() {
    this._route.params.subscribe((params: Params) => {
      let id = params['id'];
      this._api.project(id).subscribe((p: Project) => this.project = p);
    });
      

    // this._api.projects().subscribe(
    //   (projects: Project[]) =>
    //     this.projects = projects);
  }
}
