import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Session } from '../../../../core/models/event.model';
import { SessionRegistrationService } from '../../services/session-registration.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-session-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-register.component.html',
  styleUrls: ['./session-register.component.scss']
})
export class SessionRegisterComponent implements OnInit {
  @Input() session!: Session;

  isRegistered = false;
  isRegistering = false;
  isCancelling = false;
  errorMessage = '';

  constructor(
    private sessionRegistrationService: SessionRegistrationService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkRegistrationStatus();
  }

  get isAuthenticated(): boolean {
    return this.authService.isLoggedIn;
  }

  get isSessionFull(): boolean {
    return this.session.registeredAttendees >= this.session.capacity;
  }

  get canRegister(): boolean {
    return this.isAuthenticated && !this.isSessionFull && !this.isRegistered;
  }

  get canCancelRegistration(): boolean {
    return this.isAuthenticated && this.isRegistered;
  }

  get availableSpots(): number {
    return this.session.capacity - this.session.registeredAttendees;
  }

  private checkRegistrationStatus(): void {
    if (!this.isAuthenticated || !this.authService.currentUser) {
      return;
    }

    const userId = this.authService.currentUser.id;

    this.sessionRegistrationService.checkRegistrationStatus(this.session.id, userId).subscribe({
      next: (isRegistered) => {
        this.isRegistered = isRegistered;
      },
      error: (err) => {
        console.error('Error checking session registration status', err);
      }
    });
  }

  registerForSession(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/events/${this.session.eventId}` }
      });
      return;
    }

    if (!this.canRegister || !this.authService.currentUser) {
      return;
    }

    this.isRegistering = true;
    this.errorMessage = '';

    const userId = this.authService.currentUser.id;

    this.sessionRegistrationService.registerForSession(this.session.id, userId).subscribe({
      next: (success) => {
        if (success) {
          this.isRegistered = true;
          this.session.registeredAttendees += 1;
        }
        this.isRegistering = false;
      },
      error: (err) => {
        console.error('Error registering for session', err);
        this.errorMessage = 'No se pudo completar el registro. Por favor, inténtalo de nuevo.';
        this.isRegistering = false;
      }
    });
  }

  cancelRegistration(): void {
    if (!this.canCancelRegistration || !this.authService.currentUser) {
      return;
    }

    this.isCancelling = true;
    this.errorMessage = '';

    const userId = this.authService.currentUser.id;

    this.sessionRegistrationService.cancelSessionRegistration(this.session.id, userId).subscribe({
      next: (success) => {
        if (success) {
          this.isRegistered = false;
          this.session.registeredAttendees = Math.max(0, this.session.registeredAttendees - 1);
        }
        this.isCancelling = false;
      },
      error: (err) => {
        console.error('Error cancelling session registration', err);
        this.errorMessage = 'No se pudo cancelar el registro. Por favor, inténtalo de nuevo.';
        this.isCancelling = false;
      }
    });
  }
}