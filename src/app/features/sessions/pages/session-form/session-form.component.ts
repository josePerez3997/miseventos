import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SessionRepository } from '../../../../data/repositories/session.repository';
import { EventRepository } from '../../../../data/repositories/event.repository';
import { createSessionForm, sessionTimeValidator } from '../../../../core/models/session.model';
import { Session, Speaker, Event } from '../../../../core/models/event.model';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
  sessionForm!: FormGroup;
  eventId!: number;
  sessionId?: number;
  isEditing = false;
  isSubmitting = false;
  loading = true;
  errorMessage = '';
  successMessage = '';

  speakers: Speaker[] = [];
  event?: Event;
  existingSessions: Session[] = [];

  constructor(
    private sessionRepository: SessionRepository,
    private eventRepository: EventRepository,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.sessionForm = createSessionForm();

    this.route.params.subscribe(params => {
      this.eventId = +params['eventId'];

      if (params['sessionId']) {
        this.sessionId = +params['sessionId'];
        this.isEditing = true;
        this.loadSession();
      } else {
        this.isEditing = false;
        this.loadInitialData();
      }
    });

    this.sessionForm.setValidators(sessionTimeValidator);
  }

  private loadInitialData(): void {
    this.loading = true;

    this.eventRepository.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event = event;

        this.loadSpeakers();

        this.loadExistingSessions();
      },
      error: (err) => {
        console.error('Error loading event', err);
        this.errorMessage = 'Error al cargar los datos del evento. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  private loadSession(): void {
    if (!this.sessionId) return;

    this.loading = true;

    this.sessionRepository.getSession(this.sessionId).subscribe({
      next: (session) => {
        if (!session) {
          this.errorMessage = 'Sesión no encontrada';
          this.loading = false;
          return;
        }

        this.eventRepository.getEventById(this.eventId).subscribe({
          next: (event) => {
            this.event = event;

            this.loadSpeakers();

            this.loadExistingSessions(() => {
              this.sessionForm = createSessionForm({
                id: session.id,
                eventId: session.eventId,
                title: session.title,
                description: session.description,
                speaker: session.speaker,
                startTime: new Date(this.formatDateTimeForInput(new Date(session.startTime))),
                endTime: new Date(this.formatDateTimeForInput(new Date(session.endTime))),
                location: session.location,
                capacity: session.capacity
              });
              this.loading = false;
            });
          },
          error: (err) => {
            console.error('Error loading event', err);
            this.errorMessage = 'Error al cargar los datos del evento. Por favor, inténtalo de nuevo.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading session', err);
        this.errorMessage = 'Error al cargar los datos de la sesión. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  private loadSpeakers(): void {
    this.sessionRepository.getSpeakers().subscribe({
      next: (speakers) => {
        this.speakers = speakers;
      },
      error: (err) => {
        console.error('Error loading speakers', err);
        this.errorMessage = 'Error al cargar los ponentes. Por favor, inténtalo de nuevo.';
      }
    });
  }

  private loadExistingSessions(callback?: () => void): void {
    this.sessionRepository.getSessionsByEventId(this.eventId).subscribe({
      next: (sessions) => {
        this.existingSessions = sessions;
        this.loading = false;
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error loading existing sessions', err);
        this.errorMessage = 'Error al cargar las sesiones existentes. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  onSpeakerChange(event: any): void {
    const speakerId = +event.target.value;
    if (speakerId) {
      const speaker = this.speakers.find(s => s.id === speakerId);
      if (speaker) {
        this.sessionForm.get('speaker')?.setValue(speaker);
      }
    } else {
      this.sessionForm.get('speaker')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.sessionForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.sessionForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.sessionForm.value;
    const sessionData: Partial<Session> = {
      eventId: this.eventId,
      title: formValue.title,
      description: formValue.description,
      speaker: formValue.speaker,
      startTime: new Date(formValue.startTime),
      endTime: new Date(formValue.endTime),
      location: formValue.location,
      capacity: formValue.capacity,
      registeredAttendees: this.isEditing ? undefined : 0
    };

    if (this.isEditing && this.sessionId) {
      this.sessionRepository.updateSession(this.sessionId, sessionData).subscribe({
        next: (session) => {
          this.isSubmitting = false;
          this.successMessage = 'Sesión actualizada correctamente';

          setTimeout(() => {
            this.router.navigate(['/events', this.eventId]);
          }, 1500);
        },
        error: (err) => {
          console.error('Error updating session', err);
          this.errorMessage = 'Error al actualizar la sesión. Por favor, inténtalo de nuevo.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.sessionRepository.createSession(sessionData).subscribe({
        next: (session) => {
          this.isSubmitting = false;
          this.successMessage = 'Sesión creada correctamente';

          setTimeout(() => {
            this.router.navigate(['/events', this.eventId]);
          }, 1500);
        },
        error: (err) => {
          console.error('Error creating session', err);
          this.errorMessage = 'Error al crear la sesión. Por favor, inténtalo de nuevo.';
          this.isSubmitting = false;
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private formatDateTimeForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  get title() { return this.sessionForm.get('title'); }
  get description() { return this.sessionForm.get('description'); }
  get speaker() { return this.sessionForm.get('speaker'); }
  get startTime() { return this.sessionForm.get('startTime'); }
  get endTime() { return this.sessionForm.get('endTime'); }
  get location() { return this.sessionForm.get('location'); }
  get capacity() { return this.sessionForm.get('capacity'); }

  hasTimeConflict(sessionStartTime: Date, sessionEndTime: Date): boolean {
    if (!this.existingSessions || this.existingSessions.length === 0) {
      return false;
    }

    const start = new Date(sessionStartTime);
    const end = new Date(sessionEndTime);

    return this.existingSessions.some(session => {
      if (this.isEditing && session.id === this.sessionId) {
        return false;
      }

      const sessStart = new Date(session.startTime);
      const sessEnd = new Date(session.endTime);

      return (start < sessEnd && end > sessStart);
    });
  }

  get minStartDate(): string {
    if (!this.event || !this.event.date) {
      return '';
    }
    const date = new Date(this.event.date);
    return this.formatDateForInput(date);
  }

  get maxEndDate(): string {
    if (!this.event || !this.event.endDate) {
      return '';
    }
    const date = new Date(this.event.endDate);
    return this.formatDateForInput(date);
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}