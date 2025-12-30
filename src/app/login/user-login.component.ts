import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        alert('Your email has been verified successfully. You can now log in.');
      }
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login(email, password)
      .subscribe({
        next: (res: any) => {
          if (res.token) {
            console.log('Login successful, user data:', res.data);
            this.authService.storeUserData(res.token, res.data);
            
            if (res.data.role === 'user') {
              this.router.navigate(['/']);  
            } else if (res.data.role === 'admin') {
              this.router.navigate(['/admin-dashboard']);  
            }
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          alert(error || 'An error occurred during login. Please try again.');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  get f() {
    return this.loginForm.controls;
  }
}







