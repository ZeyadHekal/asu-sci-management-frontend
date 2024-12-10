import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { environment } from '../environments/enviroment';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApiModule, Configuration } from './api';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { TokenInterceptor } from './core/interceptors/token.interceptor';

export function apiConfigFactory(): Configuration {
  return new Configuration({
    basePath: environment.apiUrl,
  });
}

export function refreshPrivilegesFactory(authService: AuthService): () => Promise<string[] | undefined> {
  return () => firstValueFrom(authService.refreshPrivileges());
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(async () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      try {
        await lastValueFrom(authService.refreshPrivileges());
      } catch (err) {
        router.navigate(['/login']);
      }
    }),
  ],
};
