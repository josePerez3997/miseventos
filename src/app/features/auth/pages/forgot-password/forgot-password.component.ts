import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  isSubmitting = false;
  errorMessage = '';
  submitted = false;

  constructor(private authService: AuthService) { }

  get email() {
    return this.forgotPasswordForm.get('email')!;
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
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