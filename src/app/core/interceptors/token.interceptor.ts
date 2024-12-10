import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getAccessToken();
        const clonedReq = token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;

        return next.handle(clonedReq).pipe(
            catchError((error) => {
                if (error.status === 401 && this.authService.getRefreshToken()) {
                    // Convert the async refreshTokens method into an observable
                    return from(this.authService.refreshTokens()).pipe(
                        switchMap(() => {
                            // Retry the original request with the new token
                            const newToken = this.authService.getAccessToken();
                            const retryReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${newToken}` },
                            });
                            return next.handle(retryReq);
                        }),
                        catchError((refreshError) => {
                            // If refreshing the token fails, log out and propagate the error
                            return throwError(() => refreshError);
                        })
                    );
                }

                // For other errors, propagate the error
                return throwError(() => error);
            })
        );
    }

    private async refreshToken(): Promise<void> {
        // Assume you have an API method to refresh tokens
        return await this.authService.refreshTokens();
    }
}
