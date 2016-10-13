import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login.component';

import { DashboardComponent } from './dashboard.component';
import { AccountingComponent }  from './accounting/accounting.component';
import { AccountingHomeComponent }  from './accounting/accounting-home.component';
import { AccountingDetailsComponent }  from './accounting/accounting-details.component';

const CAOS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'dashboard', component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'accounting' },

      { path: 'accounting', component: AccountingComponent,
        children: [
          { path: '', pathMatch: 'full', component: AccountingHomeComponent },

          { path: ':id', component: AccountingDetailsComponent },
        ]
      },
    ]
  },

  { path: 'login', component: LoginComponent },
];

export const CAOS_ROUTING_PROVIDERS: any[] = [];

export const CAOS_ROUTING: ModuleWithProviders = RouterModule.forRoot(CAOS_ROUTES);
