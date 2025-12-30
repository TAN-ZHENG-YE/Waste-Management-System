import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../service/auth.service';
import { environment } from '../../../environments/environment';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements AfterViewInit {
  constructor(private httpClient: HttpClient, private authService: AuthService) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const community = this.authService.getUser().communityName;

      this.httpClient.get(`${environment.apiUrl}/user/statistics/${community}/all`)
      .subscribe({
          next: (res: any) => this.initializeCharts(res.data),
          error: (err) => alert(err.error.err || 'Server error')
      });
    }, 0);
  }

  initializeCharts(data: any): void {
    this.initializePickupStatisticsChart(data["pickupStatistics"]);
    this.initializeRecyclingRatesChart(data["recyclingRates"]);
    this.initializeIssueStatisticsChart(data["issueStatistics"]);
    this.initializeCommunityActiveMembersChart(data["communityActiveMembers"]);
  }

  initializePickupStatisticsChart(data: any): void {
    const ctx = document.getElementById('pickupStatisticsChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((item: any) => item.label),
          datasets: [{
            label: 'Waste Collected (kg)',
            data: data.map((item: any) => item.value),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
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

  initializeRecyclingRatesChart(data: any): void {
    const ctx = document.getElementById('recyclingRatesChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map((item: any) => item.label),
          datasets: [{
            label: 'Recycling Rate (%)',
            data: data.map((item: any) => item.value),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  initializeIssueStatisticsChart(data: any): void {
    const ctx = document.getElementById('issueStatisticsChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map((item: any) => item.label),
          datasets: [{
            data: data.map((item: any) => item.value),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Issue Distribution'
            }
          }
        }
      });
    }
  }

  initializeCommunityActiveMembersChart(data: any): void {
    const ctx = document.getElementById('communityActiveMembersChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map((item: any) => item.label),
          datasets: [{
            label: 'Active Members',
            data: data.map((item: any) => item.value),
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
}