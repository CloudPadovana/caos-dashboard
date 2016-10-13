import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { DashboardComponent } from './dashboard.component';
import { AccountingComponent }  from './accounting/accounting.component';
import { AccountingHomeComponent }  from './accounting/accounting-home.component';
import { AccountingDetailsComponent }  from './accounting/accounting-details.component';

const CAOS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'dashboard', component: DashboardComponent,
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
];

export const CAOS_ROUTING_PROVIDERS: any[] = [];

export const CAOS_ROUTING: ModuleWithProviders = RouterModule.forRoot(CAOS_ROUTES);
