import { NgModule }  from '@angular/core';

import { ComponentsModule } from '../../components/components.module';

import { DateRangeSelectorComponent} from './daterange-selector.component';
import { GranularitySelectorComponent } from './granularity-selector.component';
import { MetricSelectorComponent } from './metric-selector.component';
import { ProjectSelectorComponent } from './project-selector.component';
import { SeriesGraphComponent } from './series-graph.component';

import { AggregateComponent } from './aggregate.component';
import { AggregateDownloadComponent } from './aggregate-download.component';
import { AggregateGraphComponent } from './aggregate-graph.component';
import { AggregateTableComponent } from './aggregate-table.component';

@NgModule({
  declarations: [
    DateRangeSelectorComponent,
    GranularitySelectorComponent,
    MetricSelectorComponent,
    SeriesGraphComponent,

    AggregateComponent,
    AggregateDownloadComponent,
    AggregateGraphComponent,
    AggregateTableComponent,

    ProjectSelectorComponent,
  ],
  imports: [
    ComponentsModule
  ],
  exports: [
    DateRangeSelectorComponent,

    GranularitySelectorComponent,
    MetricSelectorComponent,
    SeriesGraphComponent,

    AggregateComponent,
    AggregateDownloadComponent,
    AggregateGraphComponent,
    AggregateTableComponent,

    ProjectSelectorComponent,
  ]
})
export class AccountingComponentsModule {}
