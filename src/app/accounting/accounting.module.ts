import { NgModule }  from '@angular/core';

import { ComponentsModule } from '../components/components.module';
import { AccountingComponentsModule } from './components/accounting-components.module';

import { AccountingComponent } from './accounting.component';


@NgModule({
  declarations: [
    AccountingComponent,
  ],
  imports: [
    ComponentsModule,
    AccountingComponentsModule,
  ],
  providers: [
  ]
})
export class AccountingModule {}
