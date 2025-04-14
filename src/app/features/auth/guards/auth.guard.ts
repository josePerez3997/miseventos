import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn) {
        return true;
    }

    console.log(authService.isLoggedIn);
    

    return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
    });
};

export const noAuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn) {
        return true;
    }

    return router.createUrlTree(['/']);
};