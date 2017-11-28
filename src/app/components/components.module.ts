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

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { DatepickerModule } from 'ngx-bootstrap/datepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

import * as d3 from 'd3';
import 'nvd3';
import { NvD3Module } from 'ng2-nvd3';

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
    DateRangeComponent,
    GraphComponent,
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    RouterModule,

    CollapseModule.forRoot(),
    DatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    TimepickerModule.forRoot(),

    NvD3Module,

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

    CollapseModule,
    DatepickerModule,
    PopoverModule,
    TimepickerModule,

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
