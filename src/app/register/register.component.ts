import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  communityList: string[] = [];
  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],  
      password: ['', [Validators.required, Validators.minLength(8)]],
      communityName: ['', Validators.required],   
      residentialAddress: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadCommunities();
  }

  loadCommunities() {
    this.http.get<string[]>(`${this.apiUrl}/communities`)
      .subscribe({
        next: (communities) => {
          this.communityList = communities;
        },
        error: (error) => {
          console.error('Error loading communities:', error);
        }
      });
  }

  // Method triggered on form submission
  onRegister() {
    if (this.registerForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    if (this.registerForm.valid) {
      // Add role to the form data before submitting
      const registrationData = {
        ...this.registerForm.value,
        role: 'user'  // Set default role to 'user'
      };

      this.authService.register(registrationData)
        .then(() => { 
          alert('Check your email and click the validation link to complete registration!'); 
        })
        .catch((error) => { 
          alert(error || 'An error occurred during registration. Please try again.'); 
          console.log(error); 
        });
    }
  }
}







