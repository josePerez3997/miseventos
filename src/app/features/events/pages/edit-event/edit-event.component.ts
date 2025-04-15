import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { createEventForm } from '../../../../core/models/event-form.model';
import { EventRepository } from '../../../../data/repositories/event.repository';
import { AuthService } from '../../../auth/services/auth.service';
import { EventStatus } from '../../../../core/models/event.model';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class EditEventComponent implements OnInit {
  eventForm: FormGroup;
  eventId!: number;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  availableCategories: string[] = [];
  eventStatuses = Object.values(EventStatus);

  constructor(
    private eventRepository: EventRepository,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = createEventForm();
  }

  ngOnInit(): void {
    this.loadCategories();

    this.route.params.subscribe(params => {
      this.eventId = +params['id'];
      this.loadEvent();
    });
  }

  loadEvent(): void {
    this.isLoading = true;

    this.eventRepository.getEventById(this.eventId).subscribe({
      next: (event) => {
        if (this.authService.currentUser?.id !== event.organizerId) {
          this.errorMessage = 'You are not authorized to edit this event.';
          this.isLoading = false;
          return;
        }

        this.eventForm = createEventForm({
          name: event.name,
          description: event.description,
          location: event.location,
          date: event.date,
          endDate: event.endDate,
          capacity: event.capacity,
          status: event.status,
          imageUrl: event.imageUrl,
          categories: event.categories || []
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading event', error);
        this.errorMessage = 'Failed to load event details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid || this.isSubmitting) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const eventData = {
      ...this.eventForm.value
    };

    this.eventRepository.updateEvent(this.eventId, eventData).subscribe({
      next: (updatedEvent) => {
        console.log('Event updated successfully', updatedEvent);
        this.isSubmitting = false;
        this.router.navigate(['/events', updatedEvent.id]);
      },
      error: (error) => {
        console.error('Error updating event', error);
        this.errorMessage = 'Failed to update event. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onDelete(): void {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.eventRepository.deleteEvent(this.eventId).subscribe({
      next: (success) => {
        if (success) {
          console.log('Event deleted successfully');
          this.router.navigate(['/']);
        } else {
          this.errorMessage = 'Failed to delete event. Please try again.';
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting event', error);
        this.errorMessage = 'Failed to delete event. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  private loadCategories(): void {
    this.eventRepository.getCategories().subscribe(categories => {
      this.availableCategories = categories;
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get name() {
    return this.eventForm.get('name');
  }

  get description() {
    return this.eventForm.get('description');
  }

  get location() {
    return this.eventForm.get('location');
  }

  get date() {
    return this.eventForm.get('date');
  }

  get endDate() {
    return this.eventForm.get('endDate');
  }

  get capacity() {
    return this.eventForm.get('capacity');
  }

  get status() {
    return this.eventForm.get('status');
  }

  get imageUrl() {
    return this.eventForm.get('imageUrl');
  }

  get categories() {
    return this.eventForm.get('categories');
  }

  isPastDate(date: Date | null): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  formatDateForInput(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}