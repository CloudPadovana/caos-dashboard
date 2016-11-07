import { NgModule }  from '@angular/core';

import { ComponentsModule } from '../components/components.module';
import { AccountingComponentsModule } from './components/accounting-components.module';

import { AccountingService } from './accounting.service';
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
    AccountingService,
  ]
})
export class AccountingModule {}
