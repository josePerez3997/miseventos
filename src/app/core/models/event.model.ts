export interface Event {
    id: number;
    name: string;
    description: string;
    location: string;
    date: Date;
    capacity: number;
    registeredAttendees: number;
    status: EventStatus;
    imageUrl?: string;
    organizerId: number;
}

export enum EventStatus {
    UPCOMING = 'UPCOMING',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
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
}