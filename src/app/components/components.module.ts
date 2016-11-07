import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule  } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { PopoverModule } from 'ng2-popover';

import { nvD3 } from 'ng2-nvd3';

@NgModule({
  declarations: [
    nvD3,
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    RouterModule,
    Ng2BootstrapModule,
    PopoverModule,
  ],
  exports: [
    CommonModule,
    HttpModule,
    FormsModule,
    RouterModule,
    Ng2BootstrapModule,
    PopoverModule,
    nvD3,
  ]
})
export class ComponentsModule {}
