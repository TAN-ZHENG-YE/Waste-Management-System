import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pickup-requests',
  templateUrl: './pickup-requests.component.html',
  styleUrls: ['./pickup-requests.component.css']
})
export class PickupRequestsComponent implements OnInit {
  pickupRequests: any[] = [];
  selectedRequest: any = null;
  showActionModal: boolean = false;
  isLoading: boolean = false;
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPickupRequests();
    setInterval(() => {
      this.loadPickupRequests();
    }, 30000);
  }

  loadPickupRequests() {
    const user = this.authService.getUser();
    const headers = this.authService.getAuthHeaders();

    if (!user?.communityName) {
      console.error('No community name found');
      return;
    }

    this.isLoading = true;
    this.http.get(`${this.apiUrl}/admin/pickup-requests/${user.communityName}`, { headers })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: any) => {
          this.pickupRequests = response;
          this.pickupRequests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },
        error: (error) => {
          console.error('Error loading pickup requests:', error);
          alert('Failed to load pickup requests. Please try again.');
        }
      });
  }

  onViewDetails(request: any) {
    this.selectedRequest = request;
    this.showActionModal = true;
  }

  updateRequestStatus(status: string) {
    if (!this.selectedRequest?._id) {
      console.error('No request selected');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.isLoading = true;
    
    this.http.put(`${this.apiUrl}/admin/pickup-requests/${this.selectedRequest._id}`, 
      { status: status }, 
      { headers }
    ).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response: any) => {
        this.selectedRequest.status = status;
        const index = this.pickupRequests.findIndex(req => req._id === this.selectedRequest._id);
        if (index !== -1) {
          this.pickupRequests[index].status = status;
        }
        
        this.loadPickupRequests();
        this.closeModal();
        alert(`Request ${status.toLowerCase()} successfully`);
      },
      error: (error) => {
        console.error('Error updating request:', error);
        alert('Failed to update request status. Please try again.');
      }
    });
  }

  closeModal() {
    this.showActionModal = false;
    this.selectedRequest = null;
  }
} 