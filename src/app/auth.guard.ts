import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private _router: Router, private _auth: AuthService) { }

  private is_authenticated(): Observable<boolean> {
    return this._auth.status()
      .map((status: boolean) => {
        if(status) { return true; }

        this._router.navigate(['/login']);
        return false;
      })
      .catch(() => {
        this._router.navigate(['/login']);
        return Observable.of(false);
      });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.is_authenticated();
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.is_authenticated();
  }

}
