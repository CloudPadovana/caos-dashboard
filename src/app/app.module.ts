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

import { NgModule, LOCALE_ID }  from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt);

import { SETTINGS } from './settings';
import { CAOS_ROUTING, CAOS_ROUTING_PROVIDERS } from './app.routing';

import { AppComponent } from './app.component';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SeriesService } from './series.service';

import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { AccountingComponent } from './accounting.component';
import { ProjectsComponent } from './projects.component';
import { HypervisorsComponent } from './hypervisors.component';

import { ComponentsModule } from './components/components.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AccountingComponent,
    ProjectsComponent,
    HypervisorsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    CAOS_ROUTING,
    ComponentsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: SETTINGS.LOCALE },
    CAOS_ROUTING_PROVIDERS,
    ApiService,
    AuthService,
    AuthGuard,
    SeriesService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
