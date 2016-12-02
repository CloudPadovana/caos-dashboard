////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2016 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
//
////////////////////////////////////////////////////////////////////////////////

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
