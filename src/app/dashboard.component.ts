import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent {
  constructor(private _router: Router, private _auth: AuthService) { }

  logout() {
    this._auth.logout();
    this._router.navigate(['/login']);
  }
}
