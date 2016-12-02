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

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'login',
  templateUrl: 'login.component.html'
})

export class LoginComponent {
  private username: string;
  private password: string;
  private error_message: string = '';

  constructor(private _router: Router, private _auth: AuthService) { }

  login() {
    this.error_message = '';
    this._auth.login(this.username, this.password)
      .subscribe(
        (status: boolean) => {
          if(status) {
            this._router.navigate(['/']);
          }
        },

        (e: string) => {
          this.error_message = `Login failed with error: ${e}`;}
      );
  }
}
