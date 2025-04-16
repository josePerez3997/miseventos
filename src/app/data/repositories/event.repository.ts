import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Event,
  EventListResponse,
  EventSearchParams,
  EventStatus,
  Session,
  Speaker,
  User,
  UserRole
} from '../../core/models/event.model';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EventRepository {
  private apiUrl = `${environment.apiUrl}/events`;

  private mockEvents: Event[] = this.getMockEvents();

  constructor(private http: HttpClient) { }

  getEvents(params: EventSearchParams): Observable<EventListResponse> {
    let filteredEvents = [...this.mockEvents];
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

    if (params.category && params.category !== 'all') {
      filteredEvents = filteredEvents.filter(
        event => event.categories?.includes(params.category!)
      );
    }

    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return of({
      events: paginatedEvents,
      totalCount: filteredEvents.length,
      pageSize: params.pageSize,
      currentPage: params.page
    }).pipe(delay(500)); 
  }

  getEventById(id: number): Observable<Event> {
    const event = this.mockEvents.find(e => e.id === id);

    if (event) {
      const eventCopy = { ...event };
      eventCopy.sessions = this.getMockSessionsForEvent(id);
      return of(eventCopy).pipe(delay(500));
    }

    return of({
      id: id,
      name: "Event Not Found",
      description: "The requested event could not be found.",
      location: "Unknown",
      date: new Date(),
      capacity: 0,
      registeredAttendees: 0,
      status: EventStatus.CANCELLED,
      organizerId: 0
    }).pipe(delay(500));
  }

  createEvent(eventData: Partial<Event>): Observable<Event> {
    const newEvent: Event = {
      id: this.getNextEventId(),
      name: eventData.name || 'Untitled Event',
      description: eventData.description || '',
      location: eventData.location || '',
      date: eventData.date || new Date(),
      endDate: eventData.endDate,
      capacity: eventData.capacity || 0,
      registeredAttendees: 0,
      status: eventData.status || EventStatus.UPCOMING,
      imageUrl: eventData.imageUrl,
      organizerId: eventData.organizerId || 1,
      organizer: eventData.organizer,
      categories: eventData.categories || []
    };

    this.mockEvents.push(newEvent);

    return of(newEvent).pipe(delay(800));
  }

  updateEvent(eventId: number, eventData: Partial<Event>): Observable<Event> {
    const eventIndex = this.mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      throw new Error('Event not found');
    }

    this.mockEvents[eventIndex] = {
      ...this.mockEvents[eventIndex],
      ...eventData,
      id: eventId
    };

    return of(this.mockEvents[eventIndex]).pipe(delay(800));
  }

  deleteEvent(eventId: number): Observable<boolean> {
    const eventIndex = this.mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return of(false).pipe(delay(500));
    }

    this.mockEvents.splice(eventIndex, 1);

    return of(true).pipe(delay(800));
  }

  registerForEvent(eventId: number, userId: number): Observable<boolean> {
    const eventIndex = this.mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex !== -1 && this.mockEvents[eventIndex].registeredAttendees < this.mockEvents[eventIndex].capacity) {
      this.mockEvents[eventIndex].registeredAttendees += 1;
    }

    return of(true).pipe(delay(800));
  }

  unregisterFromEvent(eventId: number, userId: number): Observable<boolean> {
    const eventIndex = this.mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex !== -1 && this.mockEvents[eventIndex].registeredAttendees > 0) {
      this.mockEvents[eventIndex].registeredAttendees -= 1;
    }

    return of(true).pipe(delay(800));
  }

  checkRegistrationStatus(eventId: number, userId: number): Observable<boolean> {
    return of(eventId % 2 === 0).pipe(delay(300));
  }

  getCategories(): Observable<string[]> {
    const categories = [
      'Technology',
      'Business',
      'Music',
      'Art',
      'Food',
      'Sports',
      'Education',
      'Entertainment',
      'Health',
      'Charity',
      'Community',
      'Workshop',
      'Conference',
      'Festival',
      'Exhibition'
    ];

    return of(categories).pipe(delay(300));
  }

  private getNextEventId(): number {
    const maxId = Math.max(...this.mockEvents.map(event => event.id), 0);
    return maxId + 1;
  }

  private getMockEvents(): Event[] {
    return [
      {
        id: 1,
        name: 'Tech Conference 2025',
        description: 'The biggest tech conference with the latest trends in AI, Web Development, Mobile and Cloud. Join us for three days of sessions, workshops, and networking opportunities with industry leaders and innovators. This year\'s focus is on AI integration and sustainability in tech.',
        location: 'Convention Center, New York',
        date: new Date('2025-06-15'),
        endDate: new Date('2025-06-17'),
        capacity: 500,
        registeredAttendees: 350,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?tech,conference',
        organizerId: 1,
        organizer: {
          id: 1,
          name: 'Tech Events Inc.',
          role: UserRole.ORGANIZER,
          imageUrl: 'https://source.unsplash.com/random/?portrait,business'
        },
        categories: ['Technology', 'AI', 'Web Development']
      },
      {
        id: 2,
        name: 'Music Festival',
        description: 'A three-day music festival featuring top artists from around the world. Experience diverse musical styles across five stages, with food vendors, art installations, and camping options available. Family-friendly activities during daytime hours.',
        location: 'Central Park, New York',
        date: new Date('2025-07-20'),
        endDate: new Date('2025-07-22'),
        capacity: 1000,
        registeredAttendees: 950,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?music,festival',
        organizerId: 2,
        organizer: {
          id: 2,
          name: 'Music Events Co.',
          role: UserRole.ORGANIZER,
          imageUrl: 'https://source.unsplash.com/random/?portrait,music'
        },
        categories: ['Music', 'Entertainment', 'Festival']
      },
      {
        id: 3,
        name: 'Art Exhibition',
        description: 'An exhibition showcasing works from emerging artists in the contemporary art scene. Featuring paintings, sculptures, digital art, and interactive installations that explore themes of identity and technology in modern society.',
        location: 'Modern Art Museum, San Francisco',
        date: new Date('2025-05-10'),
        endDate: new Date('2025-06-10'),
        capacity: 200,
        registeredAttendees: 150,
        status: EventStatus.ONGOING,
        imageUrl: 'https://source.unsplash.com/random/?art,exhibition',
        organizerId: 3,
        organizer: {
          id: 3,
          name: 'SF Art Collective',
          role: UserRole.ORGANIZER,
          imageUrl: 'https://source.unsplash.com/random/?portrait,artist'
        },
        categories: ['Art', 'Culture', 'Exhibition']
      },
      {
        id: 4,
        name: 'Business Workshop',
        description: 'Learn strategies and skills to grow your business from industry experts. This full-day workshop includes sessions on digital marketing, financial planning, and team leadership, with opportunities for one-on-one consultations with business coaches.',
        location: 'Business Center, Chicago',
        date: new Date('2025-06-05'),
        endDate: new Date('2025-06-05'),
        capacity: 100,
        registeredAttendees: 100,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?business,workshop',
        organizerId: 1,
        organizer: {
          id: 1,
          name: 'Tech Events Inc.',
          role: UserRole.ORGANIZER,
          imageUrl: 'https://source.unsplash.com/random/?portrait,business'
        },
        categories: ['Business', 'Workshop', 'Professional Development']
      },
      {
        id: 5,
        name: 'Food Festival',
        description: 'Taste dishes from renowned chefs and local food vendors from around the world. This weekend event features over 50 food stalls, cooking demonstrations, wine and craft beer tastings, and culinary competitions with audience participation.',
        location: 'Riverfront Park, Portland',
        date: new Date('2025-08-12'),
        endDate: new Date('2025-08-14'),
        capacity: 800,
        registeredAttendees: 600,
        status: EventStatus.UPCOMING,
        imageUrl: 'https://source.unsplash.com/random/?food,festival',
        organizerId: 4,
        organizer: {
          id: 4,
          name: 'Portland Food Network',
          role: UserRole.ORGANIZER,
          imageUrl: 'https://source.unsplash.com/random/?portrait,chef'
        },
        categories: ['Food', 'Culture', 'Festival']
      },
      {
        id: 6,
        name: 'Charity Run',
        description: 'A 10K run to raise funds for childrens education in underprivileged communities. The race course winds through scenic city parks with water stations and support teams. Family and spectator activities available at the start/finish area.',
        location: 'Lakeside Park, Seattle',
        date: new Date('2025-04-28'),
        endDate: new Date('2025-04-28'),
        capacity: 300,
        registeredAttendees: 280,
        status: EventStatus.COMPLETED,
        imageUrl: 'https://source.unsplash.com/random/?run,charity',
        organizerId: 5,
        organizer: {
          id: 5,
          name: 'Education For All',
          role: UserRole.ORGANIZER,
          imageUrl: 'https://source.unsplash.com/random/?portrait,volunteer'
        },
        categories: ['Sports', 'Charity', 'Community']
      }
    ];
  }

  private getMockSessionsForEvent(eventId: number): Session[] {
    const speakers: Speaker[] = [
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

    if (eventId === 1) {
      return [
        {
          id: 101,
          eventId: 1,
          title: 'Future of AI in Business',
          description: 'Explore how AI is transforming business operations and customer experiences.',
          speaker: speakers[0],
          startTime: new Date('2025-06-15T10:00:00'),
          endTime: new Date('2025-06-15T11:30:00'),
          location: 'Main Hall',
          capacity: 200,
          registeredAttendees: 180
        },
        {
          id: 102,
          eventId: 1,
          title: 'Cloud Security Challenges',
          description: 'An overview of security challenges in cloud environments and how to address them.',
          speaker: speakers[1],
          startTime: new Date('2025-06-15T13:00:00'),
          endTime: new Date('2025-06-15T14:30:00'),
          location: 'Room A',
          capacity: 100,
          registeredAttendees: 95
        },
        {
          id: 103,
          eventId: 1,
          title: 'Designing for Accessibility',
          description: 'Best practices for creating accessible digital experiences for all users.',
          speaker: speakers[2],
          startTime: new Date('2025-06-16T10:00:00'),
          endTime: new Date('2025-06-16T11:30:00'),
          location: 'Room B',
          capacity: 100,
          registeredAttendees: 85
        },
        {
          id: 104,
          eventId: 1,
          title: 'Introduction to Blockchain',
          description: 'Understanding blockchain technology and its applications beyond cryptocurrency.',
          speaker: speakers[3],
          startTime: new Date('2025-06-16T13:00:00'),
          endTime: new Date('2025-06-16T14:30:00'),
          location: 'Room C',
          capacity: 100,
          registeredAttendees: 75
        },
        {
          id: 105,
          eventId: 1,
          title: 'JavaScript Frameworks Comparison',
          description: 'Comparing the most popular JavaScript frameworks for modern web development.',
          speaker: speakers[4],
          startTime: new Date('2025-06-17T10:00:00'),
          endTime: new Date('2025-06-17T11:30:00'),
          location: 'Room A',
          capacity: 100,
          registeredAttendees: 100
        }
      ];
    }

    else if (eventId === 2) {
      return [
        {
          id: 201,
          eventId: 2,
          title: 'Rock Stage - Day 1',
          description: 'Featuring top rock bands including The Amplifiers and Electric Storm.',
          speaker: { id: 6, name: 'Various Artists', bio: 'Multiple rock bands', imageUrl: 'https://source.unsplash.com/random/?rock,band' },
          startTime: new Date('2025-07-20T14:00:00'),
          endTime: new Date('2025-07-20T22:00:00'),
          location: 'Rock Stage',
          capacity: 500,
          registeredAttendees: 480
        },
        {
          id: 202,
          eventId: 2,
          title: 'Electronic Stage - Day 1',
          description: 'DJ sets and electronic performances from BeatMaster and SynthWave.',
          speaker: { id: 7, name: 'Various DJs', bio: 'Top electronic music artists', imageUrl: 'https://source.unsplash.com/random/?dj,electronic' },
          startTime: new Date('2025-07-20T16:00:00'),
          endTime: new Date('2025-07-21T02:00:00'),
          location: 'Electronic Stage',
          capacity: 300,
          registeredAttendees: 290
        },
        {
          id: 203,
          eventId: 2,
          title: 'Acoustic Stage - Day 2',
          description: 'Intimate performances from folk and acoustic artists.',
          speaker: { id: 8, name: 'Folk Collective', bio: 'Collection of acoustic performers', imageUrl: 'https://source.unsplash.com/random/?acoustic,music' },
          startTime: new Date('2025-07-21T12:00:00'),
          endTime: new Date('2025-07-21T18:00:00'),
          location: 'Acoustic Stage',
          capacity: 200,
          registeredAttendees: 180
        }
      ];
    }

    return [
      {
        id: 901,
        eventId: eventId,
        title: 'Main Session',
        description: 'The main session for this event.',
        speaker: speakers[Math.floor(Math.random() * speakers.length)],
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 horas después
        location: 'Main Venue',
        capacity: 100,
        registeredAttendees: 80
      }
    ];
  }
}