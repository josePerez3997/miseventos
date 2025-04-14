import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Event, EventStatus, Session } from '../../../../core/models/event.model';
import { EventRepository } from '../../../../data/repositories/event.repository';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionCardComponent } from '../../components/session-card/session-card.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, SessionCardComponent]
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error = '';
  eventId!: number;
  
  isRegistered = false;
  isRegistering = false;
  isCancellingRegistration = false;
  
  get isAuthenticated(): boolean {
    return this.authService.isLoggedIn;
  }
  
  get isEventFull(): boolean {
    if (!this.event) return false;
    return this.event.registeredAttendees >= this.event.capacity;
  }
  
  get isPastEvent(): boolean {
    if (!this.event) return false;
    return this.event.status === EventStatus.COMPLETED || 
           this.event.status === EventStatus.CANCELLED;
  }
  
  get canRegister(): boolean {
    return this.isAuthenticated && !this.isEventFull && !this.isPastEvent && !this.isRegistered;
  }
  
  get canCancelRegistration(): boolean {
    return this.isAuthenticated && this.isRegistered && !this.isPastEvent;
  }
  
  get availableSpots(): number {
    if (!this.event) return 0;
    return this.event.capacity - this.event.registeredAttendees;
  }
  
  get sessionsByDay(): {date: Date, sessions: Session[]}[] {
    if (!this.event || !this.event.sessions || this.event.sessions.length === 0) {
      return [];
    }
    
    const sessionMap = new Map<string, {date: Date, sessions: Session[]}>();
    
    this.event.sessions.forEach(session => {
      const dateStr = new Date(session.startTime).toDateString();
      
      if (!sessionMap.has(dateStr)) {
        sessionMap.set(dateStr, {
          date: new Date(session.startTime),
          sessions: []
        });
      }
      
      sessionMap.get(dateStr)!.sessions.push(session);
    });
    
    const result = Array.from(sessionMap.values());
    result.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    result.forEach(day => {
      day.sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });
    
    return result;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventRepository: EventRepository,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = +params['id'];
      this.loadEvent();
    });
  }

  loadEvent(): void {
    this.loading = true;
    
    this.eventRepository.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        
        if (this.isAuthenticated) {
          this.checkRegistrationStatus();
        }
      },
      error: (err) => {
        console.error('Error loading event', err);
        this.error = 'Failed to load event. Please try again.';
        this.loading = false;
      }
    });
  }
  
  checkRegistrationStatus(): void {
    if (!this.isAuthenticated || !this.authService.currentUser) return;
    
    const userId = this.authService.currentUser.id;
    
    this.eventRepository.checkRegistrationStatus(this.eventId, userId).subscribe({
      next: (isRegistered) => {
        this.isRegistered = isRegistered;
      },
      error: (err) => {
        console.error('Error checking registration status', err);
      }
    });
  }
  
  registerForEvent(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: `/events/${this.eventId}` } 
      });
      return;
    }
    
    if (!this.authService.currentUser) return;
    
    this.isRegistering = true;
    const userId = this.authService.currentUser.id;
    
    this.eventRepository.registerForEvent(this.eventId, userId).subscribe({
      next: (success) => {
        if (success) {
          this.isRegistered = true;
          
          if (this.event) {
            this.event.registeredAttendees += 1;
          }
        }
        this.isRegistering = false;
      },
      error: (err) => {
        console.error('Error registering for event', err);
        this.isRegistering = false;
      }
    });
  }
  
  cancelRegistration(): void {
    if (!this.isAuthenticated || !this.authService.currentUser) return;
    
    this.isCancellingRegistration = true;
    const userId = this.authService.currentUser.id;
    
    this.eventRepository.unregisterFromEvent(this.eventId, userId).subscribe({
      next: (success) => {
        if (success) {
          this.isRegistered = false;
          
          if (this.event) {
            this.event.registeredAttendees -= 1;
          }
        }
        this.isCancellingRegistration = false;
      },
      error: (err) => {
        console.error('Error cancelling registration', err);
        this.isCancellingRegistration = false;
      }
    });
  }
  
  getEventStatusClass(): string {
    if (!this.event) return '';
    
    switch(this.event.status) {
      case EventStatus.UPCOMING:
        return 'status-upcoming';
      case EventStatus.ONGOING:
        return 'status-ongoing';
      case EventStatus.COMPLETED:
        return 'status-completed';
      case EventStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }
  
  formatDateRange(startDate: Date, endDate?: Date): string {
    if (!endDate || startDate.toDateString() === endDate.toDateString()) {
      return new Date(startDate).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return `${new Date(startDate).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} - ${new Date(endDate).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
  }
}