import { NgModule }  from '@angular/core';

import { ACCOUNTING_ROUTING } from './accounting.routing';
import { ComponentsModule } from '../components/components.module';
import { AccountingComponent } from './accounting.component';
import { AccountingHomeComponent } from './accounting-home.component';
import { AccountingDetailsComponent } from './accounting-details.component';

@NgModule({
  declarations: [
    AccountingComponent,
    AccountingHomeComponent,
    AccountingDetailsComponent,
  ],
  imports: [
    ACCOUNTING_ROUTING,
    ComponentsModule
  ],
  providers: [
  ]
})
export class AccountingModule {}
