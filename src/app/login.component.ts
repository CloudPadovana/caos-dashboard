import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from './api.service';

@Component({
  selector: 'login',
  templateUrl: 'login.component.html'
})

export class LoginComponent {
  private username: string;
  private password: string;
  private error_message: string = '';

  constructor(private _router: Router, private _api: ApiService) { }

  login() {
    this.error_message = '';
    let token = this._api.token(this.username, this.password)
      .subscribe(

        (token: string) => {
          this._api.set_token(token);
          this._router.navigate(['/']);
        },

        () => { this.error_message = 'Failed to login';}
      );
  }
}
