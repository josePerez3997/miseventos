import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return next(req);
    }

    const token = authService.getToken();

    if (token) {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        return next(authReq).pipe(
            catchError(error => {
                if (error.status === 401) {
                    authService.logout();
                    router.navigate(['/auth/login']);
                }
                return throwError(() => error);
            })
        );
    }

    return next(req);
};