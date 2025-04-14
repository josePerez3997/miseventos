export interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    date: Date;
    endDate?: Date;
    capacity: number;
    registeredAttendees: number;
    status: EventStatus;
    imageUrl?: string;
    organizerId: number;
    organizer?: User;
    categories?: string[];
    sessions?: Session[];
}

export interface User {
    id: number;
    name: string;
    email?: string;
    role?: UserRole;
    imageUrl?: string;
}

export interface Session {
    id: number;
    eventId: number;
    title: string;
    description: string;
    speaker: Speaker;
    startTime: Date;
    endTime: Date;
    location: string;
    capacity: number;
    registeredAttendees: number;
}

export interface Speaker {
    id: number;
    name: string;
    bio: string;
    imageUrl?: string;
}

export enum EventStatus {
    UPCOMING = 'UPCOMING',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum UserRole {
    ADMIN = 'ADMIN',
    ORGANIZER = 'ORGANIZER',
    ATTENDEE = 'ATTENDEE'
}

export interface EventListResponse {
    events: Event[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
}

export interface EventSearchParams {
    page: number;
    pageSize: number;
    searchTerm?: string;
    status?: EventStatus;
    category?: string;
}