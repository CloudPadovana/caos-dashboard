import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AccountingService, Project } from '../accounting.service';

@Component({
  selector: 'project-selector',
  templateUrl: 'accounting/components/project-selector.component.html'
})
export class ProjectSelectorComponent implements OnInit, OnDestroy {
  @Input() label: string;
  _selection: Project[];
  projects: Project[] = [];

  _subscription: Subscription;
  constructor(private _accounting: AccountingService) {}

  ngOnInit() {
    this._subscription = this._accounting.projects$.subscribe((projects: Project[]) => {
      this.projects = projects;
      this.select_all();
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  select_all() {
    this._selection = this.projects.slice(0);
  }

  unselect_all() {
    this._selection = [];
  }

  is_selected(p: Project): boolean {
    return (this._selection.indexOf(p) > -1);
  }

  toggle_selected(p: Project) {
    if(this.is_selected(p)) {
      let index = this._selection.indexOf(p);
      this._selection.splice(index, 1);
    } else {
      this._selection.push(p);
    }
  }
}
