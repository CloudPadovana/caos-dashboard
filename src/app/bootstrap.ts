import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// INJECT PRODUCTION CODE

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
