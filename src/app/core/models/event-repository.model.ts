import { Observable } from 'rxjs';
import { Event, EventListResponse, EventSearchParams } from './event.model';

export interface IEventRepository {
    getEvents(params: EventSearchParams): Observable<EventListResponse>;
    getEventById(id: number): Observable<Event>;
    createEvent(eventData: Partial<Event>): Observable<Event>;
    updateEvent(eventId: number, eventData: Partial<Event>): Observable<Event>;
    deleteEvent(eventId: number): Observable<boolean>;
    registerForEvent(eventId: number, userId: number): Observable<boolean>;
    unregisterFromEvent(eventId: number, userId: number): Observable<boolean>;
    checkRegistrationStatus(eventId: number, userId: number): Observable<boolean>;
    getCategories(): Observable<string[]>;
}