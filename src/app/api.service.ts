////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2016, 2017 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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

import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestOptionsArgs, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

import * as d3 from 'd3';
import moment from 'moment';

import { SETTINGS } from './settings';

export interface Status {
  auth: boolean;
  status: string;
  version: string;
}

export interface Tag {
  key: string;
  value: string;
  metadata: {
    [key: string] : string
  };
}

export interface GraphqlQueryResult<T> {
  data: T;
  errors: any[];
}

export const DATE_FORMAT = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");
//const UTC_PARSE = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");
//const UTC_FORMAT = d3.utcFormat("%Y-%m-%dT%H:%M:%SZ");

@Injectable()
export class ApiService {
  private _token: string;

  constructor(private __http: Http) { }

  private _httpget(url: string, options?: RequestOptionsArgs): Observable<Response> {
    if (this._token) {
      let headers = new Headers({ 'Authorization': `Bearer ${this._token}` });
      let opts = new RequestOptions({ headers: headers });
      options = opts.merge(options);
    }
    return this.__http.get(url, options);
  }

  private _httppost(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    if (this._token) {
      let headers = new Headers({ 'Authorization': `Bearer ${this._token}` });
      let opts = new RequestOptions({ headers: headers });
      options = opts.merge(options);
    }
    return this.__http.post(url, body, options);
  }

  private _graphql(body: any): Observable<Response> {
    return this._httppost(`${SETTINGS.CAOS_API_URL}/graphql`, body)
      .map((r: Response) => r.json())
      .catch(this.handle_error);
  }

  graphql_query<T>(body: {query: string, variables?: {}}): Observable<GraphqlQueryResult<T>> {
    return this._graphql(body)
      .map((data: any) => {return <GraphqlQueryResult<T>>(data)});
  }

  status(): Observable<Status> {
    return this._httpget(`${SETTINGS.CAOS_API_URL}/status`)
      .map((r: Response) => this.parse_status(r.json().data))
      .catch(this.handle_error);
  }

  private parse_status(data: any): Status {
    return <Status>({
      version: data.version,
      status: data.status,
      auth: (data.auth == "yes")
    });
  }

  token(username: string, password: string): Observable<string> {
    let params = {
      'username': username,
      'password': password
    }

    return this.__http.post(`${SETTINGS.CAOS_API_URL}/token`, params)
      .map((r: Response) => r.json().data.token)
      .catch(this.handle_error);
  }

  set_token(token: string) {
    this._token = token;
  }

  private handle_error(error: any) {
    let msg: string;

    if(error instanceof Response) {
      msg = `${error.status}: ${error.statusText}`
    } else {
      msg = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    }

    return Observable.throw(msg);
  }
}
