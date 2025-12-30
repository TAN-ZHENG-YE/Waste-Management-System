import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NotificationService } from '../../../service/notification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  selectedFile: File | null = null;
  private apiUrl = environment.apiUrl;
  communityName: string = '';
  userData: any;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Get complete user data from localStorage
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      this.userData = JSON.parse(userDataStr);
      this.communityName = this.userData.communityName;
    }
  }

  onMakeAnnouncement(announcement: string): void {
    const trimmedAnnouncement = announcement.trim();
    
    if (!trimmedAnnouncement) {
      alert('Please enter an announcement before sending.');
      return;
    }

    const token = localStorage.getItem('token');  
    if (!token) {
      alert('You must be logged in to send announcements.');
      return;
    }

    // Verify user is admin
    if (this.userData.role !== 'admin') {
      alert('Only administrators can send announcements.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${this.apiUrl}/admin/announcement`, 
      {
        announcement: trimmedAnnouncement,
        audience: this.communityName
      },
      { headers }
    ).subscribe({
      next: (response: any) => {
        alert('Announcement sent successfully to all community members.');
        // Clear the announcement text in the textarea
        const textArea = document.querySelector('textarea');
        if (textArea) textArea.value = '';
      },
      error: (error) => {
        console.error('Error sending announcement:', error);
        if (error.status === 403) {
          alert('You do not have permission to send announcements. Please ensure you are logged in as an admin.');
        } else {
          alert('Failed to send announcement. Please try again.');
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onUploadPoster(): void {
    if (!this.selectedFile) {
      alert('Please upload an image before submitting.');
      return;
    }

    const token = localStorage.getItem('token');  
    if (!token) {
      alert('You must be logged in to upload posters.');
      return;
    }

    const formData = new FormData();
    formData.append('poster', this.selectedFile);
    formData.append('communityName', this.communityName);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post(`${this.apiUrl}/admin/uploadPoster`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Poster uploaded successfully to your community.');
          this.selectedFile = null;
          // Clear the file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (error) => {
          console.error('Error uploading poster:', error);
          alert('Failed to upload poster. Please try again.');
        }
      });
  }
}
