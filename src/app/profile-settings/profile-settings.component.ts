import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserProfileService } from '../../service/userProfile.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  profileForm: FormGroup;
  private apiUrl = environment.apiUrl;
  private userId: string = '';
  communityList: string[] = [];
  isUser: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProfileSettingsComponent>,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    const user = this.authService.getUser();
    this.isUser = user?.role === 'user';
    
    this.profileForm = this.fb.group({
      fullName: [user?.fullName || '', Validators.required],
      email: [user?.email || '', [Validators.required, Validators.email]],
      contactNumber: [user?.contactNumber || '', [Validators.required, Validators.pattern('^[0-9]*$')]],
      communityName: [user?.communityName || '', Validators.required],
      residentialAddress: [user?.residentialAddress || '', Validators.required],
      profilePic: [user?.profilePic || '']
    });
    this.userId = user?._id || '';
  }

  ngOnInit() {
    if (this.isUser) {
      this.loadCommunities();
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found, please log in.');
      this.dialogRef.close();
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    
    this.userProfileService.getUserProfile(headers).subscribe({
      next: (profile) => {
        if (profile) {
          this.profileForm.patchValue(profile);
          this.userId = profile._id;
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        if (err.status === 403) {
          this.authService.logout();
        } else {
          alert('Failed to load profile. Please try again later.');
        }
      }
    });
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

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found, please log in.');
        return;
      }
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      this.userProfileService.updateUserProfile(
        { ...this.profileForm.value, userId: this.userId },
        { headers }
      ).subscribe({
        next: () => {
          alert('Profile updated successfully!');
          this.dialogRef.close({ updated: true, data: this.profileForm.value });
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          alert(err.error.err || 'Failed to update profile. Please try again later.');
        }
      });
    } else {
      alert('Please fill out all required fields correctly.');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.patchValue({ profilePic: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.click();
  }

  updateCommunityName(newCommunityName: string): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found, please log in.');
      return;
    }
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.userProfileService.updateUserProfile(
      { communityName: newCommunityName, userId: this.userId },
      { headers }
    ).subscribe(
      (response: any) => {
        console.log('Community name updated successfully');
      },
      (error: any) => {
        console.error('Error updating community name:', error);
      }
    );
  }
}