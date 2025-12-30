import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssuesComponent implements OnInit {
  issues: any[] = [];
  selectedIssue: any = null;
  showDetail: boolean = false;
  showResolveConfirmation: boolean = false;
  isLoading: boolean = false;
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.loadIssues();
  }

  formatDate(date: string): string {
    // Create date object from UTC string without timezone conversion
    const utcDate = new Date(date);
    // Format the date directly from UTC
    return utcDate.toLocaleString('en-US', { 
      timeZone: 'UTC',  // Use UTC instead of Asia/Kuala_Lumpur
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  loadIssues() {
    const community = this.authService.getUser()?.communityName;
    if (!community) {
      console.error('No community found');
      this.isLoading = false;
      return;
    }

    this.http.get<any>(`${this.apiUrl}/admin/issues/${community}`)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: response => {
          // Map the issues and format the dates
          this.issues = response.issues.map((issue: any) => ({
            ...issue,
            createdAt: this.formatDate(issue.createdAt)
          }));
          // Sort issues by date, newest first
          this.issues.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        },
        error: error => {
          console.error('Error fetching issues:', error);
          alert('Failed to load issues. Please try again.');
        }
      });
  }

  onViewDetail(issue: any): void {
    this.selectedIssue = issue;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.selectedIssue = null;
    this.showDetail = false;
  }

  onResolveIssue(issue: any): void {
    this.selectedIssue = issue;
    this.showResolveConfirmation = true;
  }

  confirmResolve(): void {
    if (!this.selectedIssue?._id) {
      console.error('No issue selected');
      return;
    }

    this.isLoading = true;
    this.http.put(`${this.apiUrl}/admin/resolveIssue/${this.selectedIssue._id}`, {})
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          const index = this.issues.findIndex(i => i._id === this.selectedIssue._id);
          if (index !== -1) {
            this.issues[index].resolved = true;
          }
          this.showResolveConfirmation = false;
          this.selectedIssue = null;
          alert('Issue resolved successfully');
        },
        error: error => {
          console.error('Error resolving issue:', error);
          alert('Failed to resolve issue. Please try again.');
        }
      });
  }

  cancelResolve(): void {
    this.showResolveConfirmation = false;
    this.selectedIssue = null;
  }
}