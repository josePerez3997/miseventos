import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Session } from '../../../../core/models/event.model';
import { SessionRepository } from '../../../../data/repositories/session.repository';
import { SessionCardComponent } from '../session-card/session-card.component';
import { AuthService } from '../../../../features/auth/services/auth.service';

interface SessionDay {
  date: Date;
  sessions: Session[];
}

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SessionCardComponent],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {
  @Input() eventId!: number;
  @Input() isOrganizer: boolean = false;

  sessions: Session[] = [];
  loading = true;
  error = '';
  sessionsByDay: SessionDay[] = [];

  constructor(
    private sessionRepository: SessionRepository,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = '';

    this.sessionRepository.getSessionsByEventId(this.eventId).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.groupSessionsByDay();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions', err);
        this.error = 'Error al cargar las sesiones. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  private groupSessionsByDay(): void {
    const sessionMap = new Map<string, SessionDay>();

    this.sessions.forEach(session => {
      const dateStr = new Date(session.startTime).toDateString();

      if (!sessionMap.has(dateStr)) {
        sessionMap.set(dateStr, {
          date: new Date(session.startTime),
          sessions: []
        });
      }

      sessionMap.get(dateStr)!.sessions.push(session);
    });

    this.sessionsByDay = Array.from(sessionMap.values());
    this.sessionsByDay.sort((a, b) => a.date.getTime() - b.date.getTime());

    this.sessionsByDay.forEach(day => {
      day.sessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });
  }

  deleteSession(sessionId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.')) {
      this.sessionRepository.deleteSession(sessionId).subscribe({
        next: (success) => {
          if (success) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.groupSessionsByDay();
          } else {
            this.error = 'No se pudo eliminar la sesión. Por favor, inténtalo de nuevo.';
          }
        },
        error: (err) => {
          console.error('Error deleting session', err);
          this.error = 'Error al eliminar la sesión. Por favor, inténtalo de nuevo.';
        }
      });
    }
  }
}