import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.requestPasswordReset(email).subscribe({
        next: (response) => {
          console.log('Reset request successful:', response);
          alert('Password reset link has been sent to your email.');
          this.router.navigate(['/user-login']);
        },
        error: (error) => {
          console.error('Error requesting password reset:', error);
          let errorMessage = 'Failed to send reset link. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}