import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../../../core/models/event.model';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SessionCardComponent {
  @Input() session!: Session;
  
  get isFullyBooked(): boolean {
    return this.session.registeredAttendees >= this.session.capacity;
  }
  
  get availableSpots(): number {
    return this.session.capacity - this.session.registeredAttendees;
  }
  
  formatTimeRange(startTime: Date, endTime: Date): string {
    return `${new Date(startTime).toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${new Date(endTime).toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  
  calculateDuration(startTime: Date, endTime: Date): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (durationHours > 0 && durationMinutes > 0) {
      return `${durationHours}h ${durationMinutes}m`;
    } else if (durationHours > 0) {
      return `${durationHours}h`;
    } else {
      return `${durationMinutes}m`;
    }
  }
}