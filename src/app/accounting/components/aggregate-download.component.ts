import { Component } from '@angular/core';
import moment from 'moment';

import { AccountingService, Project, DateRange, Aggregate, ProjectAggregate } from '../accounting.service';

@Component({
  selector: 'aggregate-download',
  template: `
<button class="btn btn-primary" type="button" (click)="download_CSV('data.csv')">Download data<i class="fa fa-fw fa-download"></i></button>
`
})
export class AggregateDownloadComponent {
  data: ProjectAggregate[];
  projects: Project[];
  daterange: DateRange;
  granularity: number;

  constructor(private _accounting: AccountingService) { }

  download_CSV(filename: string) {
    this.data = this._accounting.data;
    this.projects = this._accounting.projects;
    this.daterange = this._accounting.daterange;
    this.granularity = this._accounting.granularity;

    let data = this.data_to_CSV();

    let blob = new Blob([data], { type: 'text/csv' });
    let url = window.URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);

    a.href = url;
    a.download = filename;

    a.click();
  }

  private dataseries(p: Project): ProjectAggregate {
    return this.data.find((d: ProjectAggregate) => d.project == p);
  }

  private dataseries_sum(p: Project): number {
    return this.dataseries(p)
      .values
      .map((a: Aggregate) => a.sum)
      .reduce((acc, cur) => acc + cur, 0);
  }

  private data_to_CSV(): string {
    let s: string[] = [];

    let row: string[] = [];
    row.push("From");
    row.push("To");
    this.projects.map((p: Project) => row.push(p.name));
    s.push(row.join());

    let ts: Date[] = [];

    for (let series of this.data) {
      series.values.map((a: Aggregate) => {
        if (!ts.find((d: Date) => moment(d).isSame(a.timestamp))) {
          ts.push(new Date(a.timestamp));
        }
      });
    }

    let sorted_ts = ts.sort(
      (d1: Date, d2: Date) => ( d1.valueOf() - d2.valueOf() ));

    for (let t of sorted_ts) {
      row = [];
      row.push(moment(t).subtract(this.granularity, 'second').toString());
      row.push(moment(t).toString());

      for (let p of this.projects) {
        let tmp = this.dataseries(p).values.find((a: Aggregate) => moment(t).isSame(a.timestamp));
        if (tmp) {
          row.push((tmp.sum/3600).toString());
        } else {
          row.push("NaN");
        }
      }
      s.push(row.join());
    }

    row = [];
    row.push(moment(this.daterange.start).toString());
    row.push(moment(this.daterange.end).toString());
    for (let p of this.projects) {
      row.push((this.dataseries_sum(p)/3600).toString());
    }
    s.push(row.join());
    return s.join('\n');
  }
}
