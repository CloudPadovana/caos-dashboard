import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login.component';

import { DashboardComponent } from './dashboard.component';
import { AccountingComponent }  from './accounting/accounting.component';

const CAOS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'dashboard', component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'accounting' },

      { path: 'accounting', component: AccountingComponent },
    ]
  },

  { path: 'login', component: LoginComponent },
];

export const CAOS_ROUTING_PROVIDERS: any[] = [];

export const CAOS_ROUTING: ModuleWithProviders = RouterModule.forRoot(CAOS_ROUTES);
