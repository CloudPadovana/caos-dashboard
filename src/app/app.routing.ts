import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent }  from './home.component';
import { AccountingComponent }  from './accounting.component';


const CAOS_ROUTES: Routes = [
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full' },

  { path: 'home',
    component: HomeComponent },

  { path: 'accounting',
    component: AccountingComponent }
];

export const CAOS_ROUTING: ModuleWithProviders = RouterModule.forRoot(CAOS_ROUTES);
