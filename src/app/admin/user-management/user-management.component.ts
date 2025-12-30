import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  showDeleteConfirmation: boolean = false;
  userToDelete: any = null;
  showMessageModal: boolean = false;
  messageForm: FormGroup;
  isSending: boolean = false;
  private apiUrl = 'http://localhost:3000/api';
  showDetailsModal: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found, please log in.');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.get(`${this.apiUrl}/admin/users`, { headers }).subscribe(
      (response: any) => {
        this.users = response;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  viewUserDetails(user: any) {
    console.log('Viewing details for user:', user);
    
    const headers = this.authService.getAuthHeaders();
    this.http.get(`${this.apiUrl}/admin/users/${user._id}`, { headers })
      .subscribe({
        next: (userDetails: any) => {
          console.log('Received user details:', userDetails);
          this.selectedUser = userDetails;
          this.showDetailsModal = true;
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
        }
      });
  }

  onViewUserDetails(user: any): void {
    this.viewUserDetails(user);
  }

  closeUserDetails(): void {
    this.selectedUser = null;
  }

  onDeleteUser(user: any): void {
    this.userToDelete = user;
    this.showDeleteConfirmation = true;
  }

  confirmDeleteUser(): void {
    if (this.userToDelete) {
      const headers = this.authService.getAuthHeaders();
      this.http.delete(`${this.apiUrl}/admin/users/${this.userToDelete._id}`, { headers }).subscribe(
        (response: any) => {
          this.users = this.users.filter(u => u._id !== this.userToDelete._id);
          this.showDeleteConfirmation = false;
          this.userToDelete = null;
        },
        (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      );
    }
  }

  cancelDeleteUser(): void {
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
  }

  onSendMessage(user: any) {
    this.selectedUser = user;
    this.showMessageModal = true;
    this.messageForm.reset();
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedUser = null;
    this.messageForm.reset();
  }

  sendMessage() {
    if (this.messageForm.valid && this.selectedUser) {
      this.isSending = true;
      const headers = this.authService.getAuthHeaders();
      
      this.http.post(`${this.apiUrl}/admin/send-message`, {
        userId: this.selectedUser._id,
        communityName: this.selectedUser.communityName,
        message: this.messageForm.get('message')?.value
      }, { headers }).subscribe({
        next: () => {
          alert('Message sent successfully');
          this.closeMessageModal();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        },
        complete: () => {
          this.isSending = false;
        }
      });
    }
  }

}
