import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Event } from '../../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class EventCardComponent {
  @Input() event!: Event;

  getStatusSpanish(status: string): string {
    switch(status) {
      case 'UPCOMING':
        return 'Próximamente';
      case 'ONGOING':
        return 'En curso';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
    }
  }

  get availableSpots(): number {
    return this.event.capacity - this.event.registeredAttendees;
  }

  get isFullyBooked(): boolean {
    return this.availableSpots <= 0;
  }

  get eventStatusClass(): string {
    switch(this.event.status) {
      case 'UPCOMING':
        return 'status-upcoming';
      case 'ONGOING':
        return 'status-ongoing';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}