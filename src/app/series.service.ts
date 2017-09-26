////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2017 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/concat';

import * as d3 from 'd3';
const UTC_FORMAT = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");

import { ApiService } from './api.service';
import * as Metrics from './metrics';
export { Metrics };

export interface Sample {
  ts: Date;
  unix_ts: number;
  v: number;
}

export interface TagConfig {
  key: string;
  value?: string;
}

export interface SeriesConfig {
  label: string;

  transform(samples: Sample[]): Sample[];

  graphql_query: string;
  graphql_variables: any;

  graphql_from_variable_name: string;
  graphql_to_variable_name: string;
  graphql_granularity_variable_name: string;
}

interface IBaseSeriesParams {
  label?: string;
  metric: Metrics.IMetric;
}

abstract class BaseSeriesConfig<T extends IBaseSeriesParams> implements SeriesConfig {
  graphql_from_variable_name = "from";
  graphql_to_variable_name = "to";
  graphql_granularity_variable_name = "granularity";

  _params: T;

  constructor(kwargs: T) {
    this._params = kwargs;
  }

  abstract get graphql_variables(): any;
  graphql_query = "";

  get label(): string {
    return this._params.label;
  }

  protected get params(): T {
    return this._params;
  }

  transform(samples: Sample[]): Sample[] {
    return samples.map(
      (sample: Sample) => <Sample>({
        ...sample,

        v: sample.v * this.params.metric.scale
      }));
  }
}

export interface IAggregateSeriesParams extends IBaseSeriesParams {
  period: number;
  tags?: TagConfig[];
  tag?: TagConfig;
  aggregate?: string;
  downsample?: string;
  granularity?: number;
}

export class AggregateSeriesConfig extends BaseSeriesConfig<IAggregateSeriesParams> {
  constructor(kwargs: IAggregateSeriesParams) {
    super(kwargs);
  }

  get label(): string {
    return this.params.label || this.params.metric.label;
  }

  graphql_query = `
query($series: SeriesGroup!, $from: Datetime!, $to: Datetime!, $granularity: Int, $function: AggregateFunction, $downsample: AggregateFunction) {
  samples: aggregate(series: $series, from: $from, to: $to, granularity: $granularity, function: $function, downsample: $downsample) {
    unix_ts: unix_timestamp
    v: value
  }
}`;

  get graphql_variables() {
    return {
      series: {
        metric: {
          name: this.params.metric.name
        },
        period: this.params.period,
        tag: this.params.tag,
        tags: this.params.tags,
      },

      function: this.params.aggregate || "SUM",
      downsample: this.params.downsample || "NONE"
    };
  }
}

export interface IExpressionSeriesParams extends IBaseSeriesParams {
  expression: string;
  terms: { [name: string] : IAggregateSeriesParams };
}

export class ExpressionSeriesConfig extends BaseSeriesConfig<IExpressionSeriesParams> {
  constructor(kwargs: IExpressionSeriesParams) {
    super(kwargs);
  }

  graphql_query = `
query($from: Datetime!, $to: Datetime!, $granularity: Int, $expression: String!, $terms: [ExpressionTerm]) {
  samples: expression(from: $from, to: $to, granularity: $granularity, expression: $expression, terms: $terms) {
    unix_ts: unix_timestamp
    v: value
  }
}`;

  get graphql_variables() {
    let terms = [];
    for(let k in this.params.terms) {
      let t = this.params.terms[k];

      terms.push({
        name: k,

        series: {
          metric: {
            name: t.metric.name
          },
          period: t.period,
          tag: t.tag,
          tags: t.tags,
        },
        function: t.aggregate || "SUM",
        downsample: t.downsample || "NONE"
      });
    }

    return {
      expression: this.params.expression,
      terms: terms
    };
  }
}

export interface SeriesData {
  samples: Sample[];
  config: SeriesConfig;
}

interface GraphQLQueryResult {
  samples: Sample[];
}

@Injectable()
export class SeriesService {

  constructor(private _api: ApiService) { }

  query(series: SeriesConfig[], start: Date, end: Date, granularity: number): Observable<SeriesData> {
    let obs: Array< Observable<SeriesData> > = [];
    let req: Observable<SeriesData>;

    for(let s of series) {
      let query = s.graphql_query;

      let variables = s.graphql_variables;
      variables[s.graphql_from_variable_name] = UTC_FORMAT(start);
      variables[s.graphql_to_variable_name] = UTC_FORMAT(end);
      variables[s.graphql_granularity_variable_name] = granularity;

      req = this._api.graphql_query<GraphQLQueryResult>({
        query:  query,
        variables: variables
      })
        .map(({ data }) => data)
        .map((data: GraphQLQueryResult) => <SeriesData>({
          samples: s.transform(this.parse_data(data)),
          config: s,
        }));

      obs.push(req);
    }

    return Observable.concat(...obs);
  }

  parse_data(data: GraphQLQueryResult): Sample[] {
    return data.samples.map(
      (sample: Sample) => <Sample>({
        ts: new Date(sample.unix_ts * 1000),
        v: sample.v,
      }));
  }
}
