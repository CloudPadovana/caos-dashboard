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
          } else {
            this.error_message = 'Failed to login';
          }
        },

        (e: any) => { this.error_message = 'Failed to login';}
      );
  }
}
