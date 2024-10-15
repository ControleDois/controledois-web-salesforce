import { ApplicationConfig, LOCALE_ID, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { AuthResolver } from './shared/resolvers/auth.resolver';
import { NgxCurrencyInputMode, provideEnvironmentNgxCurrency } from 'ngx-currency';
import { DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideServiceWorker } from '@angular/service-worker';

// Registre o locale
registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    AuthResolver,
    provideEnvironmentNgxCurrency({
        align: "right",
        allowNegative: true,
        allowZero: true,
        decimal: ",",
        precision: 2,
        prefix: "R$ ",
        suffix: "",
        thousands: ".",
        nullable: true,
        min: null,
        max: null,
        inputMode: NgxCurrencyInputMode.Financial,
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideEnvironmentNgxMask(), provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }), provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),
    DatePipe,
  ]
};
