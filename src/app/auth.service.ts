import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { ApiService, Status } from './api.service';

@Injectable()
export class AuthService {
  private _token: string;

  constructor(private _api: ApiService) {
    let token = sessionStorage.getItem('token');
    if (token) {
      this.set_token(token);
    }
  }

  private set_token(token: string) {
    sessionStorage.setItem('token', token);
    this._api.set_token(token);
  }

  status(): Observable<boolean> {
    return this._api.status()
      .map((status: Status) => status.auth);
  }

  login(username: string, password: string): Observable<boolean> {
    let token = this._api.token(username, password);
    return token.flatMap(
      (token: string) => {
        this.set_token(token);
        return this.status();
      });
  }
}
