import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule  } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { PopoverModule } from 'ng2-popover';

import { nvD3 } from 'ng2-nvd3';

import { DateRangeSelectorComponent } from './daterange-selector.component';
import { GranularitySelectorComponent } from './granularity-selector.component';
import { ProjectSelectorComponent } from './project-selector.component';
import { SeriesGraphComponent } from './series-graph.component';
import { AggregateGraphComponent } from './aggregate-graph.component';


@NgModule({
  declarations: [
    nvD3,
    DateRangeSelectorComponent,
    GranularitySelectorComponent,
    SeriesGraphComponent,
    AggregateGraphComponent,
    ProjectSelectorComponent,
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    Ng2BootstrapModule,
    PopoverModule,
  ],
  exports: [
    CommonModule,
    HttpModule,
    FormsModule,
    Ng2BootstrapModule,
    PopoverModule,
    nvD3,
    DateRangeSelectorComponent,
    GranularitySelectorComponent,
    SeriesGraphComponent,
    AggregateGraphComponent,
    ProjectSelectorComponent,
  ]
})
export class ComponentsModule {}
