import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Event, EventListResponse, EventSearchParams, EventStatus } from '../../core/models/event.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EventRepository {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  getEvents(params: EventSearchParams): Observable<EventListResponse> {

    const mockEvents: Event[] = [
      {
        id: 1,
        name: 'Conferencia de Tecnología 2025',
        description: 'La conferencia de tecnología más grande con las últimas tendencias en IA, Desarrollo Web, Móvil y Nube.',
        location: 'Centro de Convenciones, Nueva York',
        date: new Date('2025-06-15'),
        capacity: 500,
        registeredAttendees: 350,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?tech,conference',
        organizerId: 1
      },
      {
        id: 2,
        name: 'Festival de Música',
        description: 'Un festival de música de tres días con artistas de primer nivel de todo el mundo.',
        location: 'Central Park, Nueva York',
        date: new Date('2025-07-20'),
        capacity: 1000,
        registeredAttendees: 950,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?music,festival',
        organizerId: 2
      },
      {
        id: 3,
        name: 'Exposición de Arte',
        description: 'Una exposición que muestra obras de artistas emergentes en la escena del arte contemporáneo.',
        location: 'Museo de Arte Moderno, San Francisco',
        date: new Date('2025-05-10'),
        capacity: 200,
        registeredAttendees: 150,
        status: EventStatus.ONGOING,
        imageUrl: 'https://source.unsplash.com/random/?art,exhibition',
        organizerId: 3
      },
      {
        id: 4,
        name: 'Taller de Negocios',
        description: 'Aprende estrategias y habilidades para hacer crecer tu negocio de la mano de expertos de la industria.',
        location: 'Centro de Negocios, Chicago',
        date: new Date('2025-06-05'),
        capacity: 100,
        registeredAttendees: 100,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?business,workshop',
        organizerId: 1
      },
      {
        id: 5,
        name: 'Festival Gastronómico',
        description: 'Degusta platos de reconocidos chefs y vendedores locales de comida de todo el mundo.',
        location: 'Parque Riverfront, Portland',
        date: new Date('2025-08-12'),
        capacity: 800,
        registeredAttendees: 600,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?food,festival',
        organizerId: 4
      },
      {
        id: 6,
        name: 'Carrera Benéfica',
        description: 'Una carrera de 10K para recaudar fondos para la educación infantil en comunidades desfavorecidas.',
        location: 'Parque Lakeside, Seattle',
        date: new Date('2025-04-28'),
        capacity: 300,
        registeredAttendees: 280,
        status: EventStatus.COMPLETED,
        imageUrl: 'https://source.unsplash.com/random/?run,charity',
        organizerId: 5
      }
    ];

    let filteredEvents = [...mockEvents];
    if (params.searchTerm) {
      const searchLower = params.searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(
        event => event.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
      );
    }

    if (params.status) {
      filteredEvents = filteredEvents.filter(event => event.status === params.status);
    }

    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return of({
      events: paginatedEvents,
      totalCount: filteredEvents.length,
      pageSize: params.pageSize,
      currentPage: params.page
    });
  }

  getEventById(id: number): Observable<Event> {
    const mockEvent: Event = {
      id: id,
      name: 'Tech Conference 2025',
      description: 'The biggest tech conference with the latest trends in AI, Web Development, Mobile and Cloud.',
      location: 'Convention Center, New York',
      date: new Date('2025-06-15'),
      capacity: 500,
      registeredAttendees: 350,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://source.unsplash.com/random/?tech,conference',
      organizerId: 1
    };

    return of(mockEvent);
  }

}