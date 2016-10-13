import { NgModule, LOCALE_ID }  from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SETTINGS } from './settings';
import { CAOS_ROUTING, CAOS_ROUTING_PROVIDERS } from './app.routing';

import { AppComponent } from './app.component';
import { ApiService } from './api.service';
import { AuthGuard } from './auth.guard';

import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';

import { ComponentsModule } from './components/components.module';
import { AccountingModule } from './accounting/accounting.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    CAOS_ROUTING,
    ComponentsModule,
    AccountingModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: SETTINGS.LOCALE },
    CAOS_ROUTING_PROVIDERS,
    ApiService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
