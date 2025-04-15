import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Speaker } from '../../core/models/event.model';

export interface SessionFormData {
    id?: number;
    eventId: number;
    title: string;
    description: string;
    speaker: Speaker;
    startTime: Date;
    endTime: Date;
    location: string;
    capacity: number;
}

export function createSessionForm(data?: Partial<SessionFormData>): FormGroup {
    return new FormGroup({
        title: new FormControl(data?.title || '', [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(100)
        ]),
        description: new FormControl(data?.description || '', [
            Validators.required,
            Validators.minLength(20),
            Validators.maxLength(1000)
        ]),
        speaker: new FormControl(data?.speaker || null, [
            Validators.required
        ]),
        startTime: new FormControl(data?.startTime || null, [
            Validators.required
        ]),
        endTime: new FormControl(data?.endTime || null, [
            Validators.required
        ]),
        location: new FormControl(data?.location || '', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100)
        ]),
        capacity: new FormControl(data?.capacity || 10, [
            Validators.required,
            Validators.min(1),
            Validators.max(1000)
        ])
    });
}

export function sessionTimeValidator(formGroup: FormGroup) {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;

    if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
            formGroup.get('endTime')?.setErrors({ endTimeInvalid: true });
            return { endTimeInvalid: true };
        }
    }

    return null;
}

export function sessionOverlapValidator(existingSessions: Array<{
    id: string; startTime: Date, endTime: Date
}>) {
    return (formGroup: FormGroup) => {
        const startTime = formGroup.get('startTime')?.value;
        const endTime = formGroup.get('endTime')?.value;
        const sessionId = formGroup.get('id')?.value;

        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);

            const hasOverlap = existingSessions.some(session => {
                if (sessionId && session.id === sessionId) {
                    return false;
                }

                const sessStart = new Date(session.startTime);
                const sessEnd = new Date(session.endTime);

                return (start < sessEnd && end > sessStart);
            });

            if (hasOverlap) {
                formGroup.get('startTime')?.setErrors({ sessionOverlap: true });
                return { sessionOverlap: true };
            }
        }

        return null;
    };
}