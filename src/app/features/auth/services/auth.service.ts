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

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private tokenKey = 'auth_token';

    // Para desarrollo, usamos un usuario de prueba
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
        return !!this.getToken();
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    login(credentials: LoginRequest): Observable<User> {
        // Para desarrollo, verificamos credenciales fijas
        if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
            const token = 'fake_jwt_token_' + Math.random().toString(36).substr(2);
            localStorage.setItem(this.tokenKey, token);
            this.currentUserSubject.next(this.testUser);
            return of(this.testUser).pipe(delay(1000)); // Simulamos retraso de la red
        } else {
            return throwError(() => new Error('Invalid email or password'));
        }
    }

    register(userData: RegisterRequest): Observable<User> {
        // Simulamos el registro
        if (userData.email === 'test@example.com') {
            return throwError(() => new Error('Email already registered'));
        }

        const newUser: User = {
            id: 2, // En un sistema real esto sería asignado por el backend
            name: userData.name,
            email: userData.email
        };

        // No hacemos login automático después del registro
        return of(newUser).pipe(delay(1000)); // Simulamos retraso de la red
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    private loadUserFromStorage(): void {
        const token = this.getToken();

        if (token) {
            // En un sistema real, decodificaríamos el token para obtener el usuario
            // Por ahora, simplemente asumimos que es el usuario de prueba
            this.currentUserSubject.next(this.testUser);
        }
    }
}