import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private tokenKey = 'auth_token';
    private tokenExpiryKey = 'auth_token_expiry';

    private testUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
    };

    constructor(private router: Router) {
        this.loadUserFromStorage();
    }

    get currentUser$(): Observable<User | null> {
        return this.currentUserSubject.asObservable();
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isLoggedIn(): boolean {
        if (!this.getToken()) {
            return false;
        }

        const expiry = this.getTokenExpiry();
        if (expiry && new Date() > new Date(expiry)) {
            this.logout();
            return false;
        }

        return true;
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getTokenExpiry(): string | null {
        return localStorage.getItem(this.tokenExpiryKey);
    }

    login(credentials: LoginRequest): Observable<User> {
        if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
            const token = 'fake_jwt_token_' + Math.random().toString(36).substr(2);

            const expiry = new Date();
            expiry.setHours(expiry.getHours() + 1);

            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());

            this.currentUserSubject.next(this.testUser);
            return of(this.testUser).pipe(delay(1000));
        } else {
            return throwError(() => new Error('Invalid email or password'));
        }
    }

    register(userData: RegisterRequest): Observable<User> {
        if (userData.email === 'test@example.com') {
            return throwError(() => new Error('Email already registered'));
        }

        const newUser: User = {
            id: 2,
            name: userData.name,
            email: userData.email
        };

        return of(newUser).pipe(delay(1000));
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.tokenExpiryKey);
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    forgotPassword(email: string): Observable<boolean> {
        return of(true).pipe(delay(1000));
    }

    resetPassword(resetRequest: ResetPasswordRequest): Observable<boolean> {
        return of(true).pipe(delay(1000));
    }

    refreshToken(): Observable<string> {
        const newToken = 'refreshed_jwt_token_' + Math.random().toString(36).substr(2);

        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);

        localStorage.setItem(this.tokenKey, newToken);
        localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());

        return of(newToken).pipe(delay(1000));
    }

    private loadUserFromStorage(): void {
        const token = this.getToken();

        if (token) {
            const expiry = this.getTokenExpiry();
            if (expiry && new Date() > new Date(expiry)) {
                this.logout();
                return;
            }
            this.currentUserSubject.next(this.testUser);
        }
    }
}