import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Session } from '../models/event.model';

export function timeConflictValidator(existingSessions: Session[], currentSessionId?: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const startTime = control.get('startTime')?.value;
        const endTime = control.get('endTime')?.value;

        if (!startTime || !endTime) {
            return null;
        }

        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);

        if (endDateTime <= startDateTime) {
            return { endTimeBeforeStart: true };
        }

        const hasConflict = existingSessions.some(session => {
            if (currentSessionId && session.id === currentSessionId) {
                return false;
            }

            const sessionStart = new Date(session.startTime);
            const sessionEnd = new Date(session.endTime);

            return startDateTime < sessionEnd && endDateTime > sessionStart;
        });

        if (hasConflict) {
            return { timeConflict: true };
        }

        return null;
    };
}

export function sessionWithinEventDateValidator(eventStartDate: Date, eventEndDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const startTime = control.get('startTime')?.value;
        const endTime = control.get('endTime')?.value;

        if (!startTime || !endTime) {
            return null;
        }

        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        const eventStart = new Date(eventStartDate);

        if (startDateTime < eventStart) {
            return { sessionBeforeEvent: true };
        }

        if (eventEndDate) {
            const eventEnd = new Date(eventEndDate);
            eventEnd.setHours(23, 59, 59, 999);

            if (endDateTime > eventEnd) {
                return { sessionAfterEvent: true };
            }
        }

        return null;
    };
}