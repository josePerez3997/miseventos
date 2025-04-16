import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator });

  isSubmitting = false;
  errorMessage = '';
  submitted = false;
  isTokenValid = false;
  resetToken = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.resetToken = this.route.snapshot.queryParamMap.get('token') || '';

    this.isTokenValid = !!this.resetToken;

    if (!this.isTokenValid) {
      console.error('Invalid or missing reset token');
    }
  }

  get password() {
    return this.resetPasswordForm.get('password')!;
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword')!;
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid || !this.isTokenValid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    setTimeout(() => {
      this.isSubmitting = false;
      this.submitted = true;
    }, 1500);
  }
}