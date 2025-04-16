import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';

@Injectable({
    providedIn: 'root'
})
export class SessionRegistrationService {
    private apiUrl = `${environment.apiUrl}/session-registrations`;

    private mockRegistrations: { userId: number, sessionId: number }[] = [];

    constructor(private http: HttpClient) { }

    registerForSession(sessionId: number, userId: number): Observable<boolean> {
        const isAlreadyRegistered = this.mockRegistrations.some(
            reg => reg.sessionId === sessionId && reg.userId === userId
        );

        if (isAlreadyRegistered) {
            return of(true).pipe(delay(300));
        }

        this.mockRegistrations.push({ sessionId, userId });
        return of(true).pipe(delay(800));
    }

    cancelSessionRegistration(sessionId: number, userId: number): Observable<boolean> {
        const index = this.mockRegistrations.findIndex(
            reg => reg.sessionId === sessionId && reg.userId === userId
        );

        if (index !== -1) {
            this.mockRegistrations.splice(index, 1);
            return of(true).pipe(delay(800));
        }

        return of(false).pipe(delay(300));
    }

    checkRegistrationStatus(sessionId: number, userId: number): Observable<boolean> {
        const isRegistered = this.mockRegistrations.some(
            reg => reg.sessionId === sessionId && reg.userId === userId
        );

        return of(isRegistered).pipe(delay(300));
    }

    getUserRegisteredSessions(userId: number): Observable<number[]> {
        const sessionIds = this.mockRegistrations
            .filter(reg => reg.userId === userId)
            .map(reg => reg.sessionId);

        return of(sessionIds).pipe(delay(500));
    }

    getSessionRegisteredUsers(sessionId: number): Observable<number[]> {
        const userIds = this.mockRegistrations
            .filter(reg => reg.sessionId === sessionId)
            .map(reg => reg.userId);

        return of(userIds).pipe(delay(500));
    }
}