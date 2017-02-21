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

import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule  } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ngx-bootstrap';
import * as d3 from 'd3';
import 'nvd3';
import { nvD3 } from 'ng2-nvd3';

import { DateRangeComponent } from './daterange.component';
import { GraphComponent } from './graph.component';

import {
  DataTableModule,
  DropdownModule,
  MultiSelectModule,
  SelectButtonModule,
  TooltipModule,
} from 'primeng/primeng';

@NgModule({
  declarations: [
    nvD3,

    DateRangeComponent,
    GraphComponent,
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    RouterModule,
    Ng2BootstrapModule.forRoot(),

    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    SelectButtonModule,
    TooltipModule,
  ],
  exports: [
    CommonModule,
    HttpModule,
    FormsModule,
    RouterModule,
    Ng2BootstrapModule,
    nvD3,

    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    SelectButtonModule,
    TooltipModule,

    DateRangeComponent,
    GraphComponent,
  ]
})
export class ComponentsModule {}
