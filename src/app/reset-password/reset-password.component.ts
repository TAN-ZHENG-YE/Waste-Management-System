import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  tokenInvalid = false;
  private token: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    this.validateToken();
  }

  private validateToken() {
    this.authService.validateResetToken(this.token).subscribe({
      error: () => {
        this.tokenInvalid = true;
      }
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const newPassword = this.resetForm.get('password')?.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          alert('Password has been reset successfully!');
          this.router.navigate(['/user-login']);
        },
        error: (error) => {
          console.error('Error resetting password:', error);
          alert(error.error?.message || 'Failed to reset password. Please try again.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
