import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingsComponent } from '../../profile-settings/profile-settings.component';
import { CommunityService } from '../../../service/community.service';

Chart.register(...registerables);

interface CommunityDetails {
  _id?: string;
  name: string;
  address: string;
  pickupSchedule: string;
  totalMembers: number;
}

@Component({
  selector: 'app-community-management',
  templateUrl: './community-management.component.html',
  styleUrls: ['./community-management.component.css']
})
export class CommunityManagementComponent implements OnInit, AfterViewInit {
  communityDetails: CommunityDetails = {
    name: '',
    address: '',
    pickupSchedule: '',
    totalMembers: 0
  };
  isEditing: boolean = false;
  communityStats: any = {};
  loading: boolean = true;
  error: string = '';

  constructor(
    private communityService: CommunityService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadCommunityDetails();
  }

  loadCommunityDetails(): void {
    this.loading = true;
    this.communityService.getCommunityDetails()
      .subscribe({
        next: (response) => {
          this.communityDetails = response;
          this.loading = false;
          this.error = '';
          this.updateCommunityStats();
        },
        error: (error) => {
          console.error('Error loading community details:', error);
          this.error = 'Failed to load community details';
          this.loading = false;
        }
      });
  }

  updateCommunityStats(): void {
    this.communityStats = {
      totalMembers: this.communityDetails.totalMembers,
      activeRequests: 0, // You can add an endpoint to get this
      totalWasteCollected: 0, // You can add an endpoint to get this
      recyclingRate: 0 // You can add an endpoint to get this
    };
    this.initializeCommunityStatsChart();
  }

  onSaveCommunityChanges(): void {
    if (!this.communityDetails.address || !this.communityDetails.pickupSchedule) {
      this.error = 'Please fill out all required fields';
      return;
    }

    const updatedDetails = {
      address: this.communityDetails.address,
      pickupSchedule: this.communityDetails.pickupSchedule,
      name: this.communityDetails.name
    };

    this.communityService.updateCommunityDetails(updatedDetails)
      .subscribe({
        next: (response: any) => {
          console.log('Community details updated:', response);
          this.isEditing = false;
          this.error = '';
          this.loadCommunityDetails();
          alert('Community details updated successfully!');
        },
        error: (error) => {
          console.error('Error details:', error);
          this.error = error.error?.message || 'Failed to update community details';
          alert('Failed to update community details. Please try again.');
        }
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCommunityStatsChart();
    }, 0);
  }

  initializeCommunityStatsChart(): void {
    const ctx = document.getElementById('communityStatsChart') as HTMLCanvasElement;
    if (ctx && this.communityStats) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Total Members', 'Active Requests', 'Waste Collected (kg)', 'Recycling Rate (%)'],
          datasets: [{
            label: 'Community Statistics',
            data: [
              this.communityStats.totalMembers,
              this.communityStats.activeRequests,
              this.communityStats.totalWasteCollected,
              this.communityStats.recyclingRate
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 159, 64, 0.6)',
              'rgba(255, 205, 86, 0.6)',
              'rgba(54, 162, 235, 0.6)'
            ],
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadCommunityDetails();
    }
  }

  openProfileSettings(): void {
    const dialogRef = this.dialog.open(ProfileSettingsComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.loadCommunityDetails();
        this.updateCommunityStats();
      }
    });
  }

  refreshData(): void {
    this.loadCommunityDetails();
    this.updateCommunityStats();
  }
}