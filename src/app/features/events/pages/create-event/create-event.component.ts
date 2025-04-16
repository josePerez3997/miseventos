import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { createEventForm } from '../../../../core/models/event-form.model';
import { EventRepository } from '../../../../data/repositories/event.repository';
import { AuthService } from '../../../auth/services/auth.service';
import { EventStatus } from '../../../../core/models/event.model';

@Component({
    selector: 'app-create-event',
    templateUrl: './create-event.component.html',
    styleUrls: ['./create-event.component.scss'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class CreateEventComponent implements OnInit {
    eventForm: FormGroup;
    isSubmitting = false;
    errorMessage = '';
    availableCategories: string[] = [];
    eventStatuses = Object.values(EventStatus);

    constructor(
        private eventRepository: EventRepository,
        private authService: AuthService,
        private router: Router
    ) {
        this.eventForm = createEventForm();
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    onSubmit(): void {
        if (this.eventForm.invalid || this.isSubmitting) {
            this.markFormGroupTouched(this.eventForm);
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const eventData = {
            ...this.eventForm.value,
            organizerId: this.authService.currentUser?.id || 1,
            registeredAttendees: 0,
            imageUrl: this.eventForm.value.imageUrl || `https://source.unsplash.com/random/?${this.eventForm.value.categories[0] || 'event'}`
        };

        this.eventRepository.createEvent(eventData).subscribe({
            next: (createdEvent) => {
                console.log('Event created successfully', createdEvent);
                this.isSubmitting = false;
                this.router.navigate(['/events', createdEvent.id]);
            },
            error: (error) => {
                console.error('Error creating event', error);
                this.errorMessage = 'Failed to create event. Please try again.';
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