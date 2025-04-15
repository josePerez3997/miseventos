import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Session, Speaker } from '../../core/models/event.model';
import { environment } from '../../../environments/environments';

@Injectable({
    providedIn: 'root'
})
export class SessionRepository {
    private apiUrl = `${environment.apiUrl}/sessions`;

    private mockSessions: Session[] = [];
    private mockSpeakers: Speaker[] = [
        {
            id: 1,
            name: 'John Smith',
            bio: 'John is a technology leader with over 15 years experience in AI and machine learning.',
            imageUrl: 'https://source.unsplash.com/random/?portrait,man,professional'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            bio: 'Sarah is the CTO of TechInnovate and specializes in cloud architecture.',
            imageUrl: 'https://source.unsplash.com/random/?portrait,woman,professional'
        },
        {
            id: 3,
            name: 'Michael Wong',
            bio: 'Michael is a UI/UX expert and has worked with major tech companies.',
            imageUrl: 'https://source.unsplash.com/random/?portrait,asian,man'
        },
        {
            id: 4,
            name: 'Emily Chen',
            bio: 'Emily is a cybersecurity specialist with experience in financial institutions.',
            imageUrl: 'https://source.unsplash.com/random/?portrait,asian,woman'
        },
        {
            id: 5,
            name: 'David Martinez',
            bio: 'David is a full-stack developer and open source contributor.',
            imageUrl: 'https://source.unsplash.com/random/?portrait,latino,man'
        }
    ];

    constructor(private http: HttpClient) { }

    getSessionsByEventId(eventId: number): Observable<Session[]> {
        const sessions = this.mockSessions.filter(session => session.eventId === eventId);
        return of(sessions).pipe(delay(500));
    }

    getSession(sessionId: number): Observable<Session> {
        const session = this.mockSessions.find(s => s.id === sessionId);
        if (session) {
            return of(session).pipe(delay(300));
        }
        return of(null).pipe(delay(300));
    }

    createSession(sessionData: Partial<Session>): Observable<Session> {
        const newId = this.getNextSessionId();
        const newSession: Session = {
            id: newId,
            eventId: sessionData.eventId,
            title: sessionData.title || 'Untitled Session',
            description: sessionData.description || '',
            speaker: sessionData.speaker,
            startTime: sessionData.startTime || new Date(),
            endTime: sessionData.endTime || new Date(),
            location: sessionData.location || '',
            capacity: sessionData.capacity || 10,
            registeredAttendees: 0
        };

        this.mockSessions.push(newSession);
        return of(newSession).pipe(delay(500));
    }

    updateSession(sessionId: number, sessionData: Partial<Session>): Observable<Session> {
        const index = this.mockSessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            const updatedSession = {
                ...this.mockSessions[index],
                ...sessionData,
                id: sessionId
            };
            this.mockSessions[index] = updatedSession;
            return of(updatedSession).pipe(delay(500));
        }
        return of(null).pipe(delay(500));
    }

    deleteSession(sessionId: number): Observable<boolean> {
        const index = this.mockSessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            this.mockSessions.splice(index, 1);
            return of(true).pipe(delay(500));
        }
        return of(false).pipe(delay(500));
    }

    getSpeakers(): Observable<Speaker[]> {
        return of(this.mockSpeakers).pipe(delay(300));
    }

    private getNextSessionId(): number {
        if (this.mockSessions.length === 0) {
            return 1;
        }
        return Math.max(...this.mockSessions.map(s => s.id)) + 1;
    }
}