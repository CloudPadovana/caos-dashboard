////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2016, 2017, 2018 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SETTINGS } from './settings';
import { AuthService } from './auth.service';
import { DateRangeService } from './daterange.service';

@Component({
  templateUrl: 'dashboard.component.html',
  providers: [ DateRangeService ]
})
export class DashboardComponent {
  navbarCollapsed: boolean = false;

  constructor(private _router: Router, private _auth: AuthService) { }

  logout() {
    this._auth.logout();
    this._router.navigate(['/login']);
  }

  get site_name(): string {
    if(SETTINGS.CAOS_SITE_NAME) {
      return SETTINGS.CAOS_SITE_NAME;
    } else {
      return "Home";
    }
  }
}
