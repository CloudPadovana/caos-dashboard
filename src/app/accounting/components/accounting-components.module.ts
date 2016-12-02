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

import { NgModule }  from '@angular/core';

import { ComponentsModule } from '../../components/components.module';

import { DateRangeSelectorComponent} from './daterange-selector.component';
import { GranularitySelectorComponent } from './granularity-selector.component';
import { MetricSelectorComponent } from './metric-selector.component';
import { ProjectSelectorComponent } from './project-selector.component';
import { SeriesGraphComponent } from './series-graph.component';

import { AggregateComponent } from './aggregate.component';
import { AggregateGraphComponent } from './aggregate-graph.component';
import { AggregateTableComponent } from './aggregate-table.component';

@NgModule({
  declarations: [
    DateRangeSelectorComponent,
    GranularitySelectorComponent,
    MetricSelectorComponent,
    SeriesGraphComponent,

    AggregateComponent,
    AggregateGraphComponent,
    AggregateTableComponent,

    ProjectSelectorComponent,
  ],
  imports: [
    ComponentsModule
  ],
  exports: [
    DateRangeSelectorComponent,

    GranularitySelectorComponent,
    MetricSelectorComponent,
    SeriesGraphComponent,

    AggregateComponent,
    AggregateGraphComponent,
    AggregateTableComponent,

    ProjectSelectorComponent,
  ]
})
export class AccountingComponentsModule {}
