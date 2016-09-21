import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountingComponent }  from './accounting.component';
import { AccountingHomeComponent }  from './accounting-home.component';
import { AccountingDetailsComponent }  from './accounting-details.component';


const ACCOUNTING_ROUTES: Routes = [
  { path: 'accounting',
    component: AccountingComponent,
    children: [
      {path: '',
       component: AccountingHomeComponent
      },
      {path: ':id',
       component: AccountingDetailsComponent
      },
    ]
  }
];

export const ACCOUNTING_ROUTING: ModuleWithProviders = RouterModule.forRoot(ACCOUNTING_ROUTES);
