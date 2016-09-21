import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent }  from './home.component';


const CAOS_ROUTES: Routes = [
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full' },

  { path: 'home',
    component: HomeComponent },

];

export const CAOS_ROUTING_PROVIDERS: any[] = [];

export const CAOS_ROUTING: ModuleWithProviders = RouterModule.forRoot(CAOS_ROUTES);
