import { NgModule }  from '@angular/core';

import { ComponentsModule } from '../components/components.module';
import { AccountingComponent } from './accounting.component';

@NgModule({
  declarations: [
    AccountingComponent,
  ],
  imports: [
    ComponentsModule
  ],
  providers: [
  ]
})
export class AccountingModule {}
