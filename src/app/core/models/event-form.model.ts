import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { EventStatus } from './event.model';

export interface EventFormData {
    name: string;
    description: string;
    location: string;
    date: Date;
    endDate?: Date;
    capacity: number;
    status: EventStatus;
    imageUrl?: string;
    categories: string[];
}

export function createEventForm(data?: Partial<EventFormData>): FormGroup {
    return new FormGroup({
        name: new FormControl(data?.name || '', [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(100)
        ]),
        description: new FormControl(data?.description || '', [
            Validators.required,
            Validators.minLength(20),
            Validators.maxLength(2000)
        ]),
        location: new FormControl(data?.location || '', [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(200)
        ]),
        date: new FormControl(data?.date || null, [
            Validators.required
        ]),
        endDate: new FormControl(data?.endDate || null),
        capacity: new FormControl(data?.capacity || 0, [
            Validators.required,
            Validators.min(1),
            Validators.max(10000)
        ]),
        status: new FormControl(data?.status || EventStatus.UPCOMING, [
            Validators.required
        ]),
        imageUrl: new FormControl(data?.imageUrl || ''),
        categories: new FormControl(data?.categories || [])
    });
}