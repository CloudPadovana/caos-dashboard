import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApiService, Status } from './api.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private _router: Router, private _api: ApiService) { }

  private is_authenticated(): Observable<boolean> {
    return this._api.status()
      .map((status: Status) => {
        if(status.auth) { return true; }

        this._router.navigate(['/login']);
        return false;
      });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.is_authenticated();
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.is_authenticated();
  }

}
