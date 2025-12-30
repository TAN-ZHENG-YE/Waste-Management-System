import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Poster {
  url: string;
  communityName: string;
  uploadedAt: Date;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  private apiUrl = environment.apiUrl;
  buttons = [
    { image: '/image/360_F_921495709_xuELeKTVA1jTnRUvPWxP2uuNYqw9EtQ5.jpg', text: 'Schedule Waste Pickup', link: '/schedule-pickup' },
    { image: '/image/view-pick-up-history.jpg', text: 'View Pickup History', link: '/view-history' },
    { image: '/image/report_issue.jpeg', text: 'Report Issues', link: '/report-issues' },
    { image: '/image/generate-report.jpeg', text: 'Generate Reports', link: '/view-report' }
  ];
  
  images: string[] = [];
  currentIndex = 0;
  intervalId: any;
  userCommunity: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUserCommunityAndPosters();
    this.startAutoSlide();
  }

  ngAfterViewInit() {
  }

  loadUserCommunityAndPosters() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      console.log('Missing auth data:', { hasToken: !!token, hasUserData: !!userData });
      this.images = ['/image/poster-4.jpg'];
      return;
    }

    const user = JSON.parse(userData);
    console.log('User data from Local Storage:', user);
    const userId = user._id;

    this.http.get(`${this.apiUrl}/user/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe((user: any) => {
      this.userCommunity = user.communityName;
      console.log('User profile loaded:', {
        userId: userId,
        community: this.userCommunity,
        token: token?.substring(0, 10) + '...'
      });
      
      if (!this.userCommunity) {
        console.log('User has no community, showing default image');
        this.images = ['/image/poster-4.jpg'];
        return;
      }
      
      this.http.get<Poster[]>(`${this.apiUrl}/posters/${this.userCommunity}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe(
        (posters) => {
          console.log('Received posters for community:', {
            community: this.userCommunity,
            posterCount: posters?.length,
            posters: posters
          });
          if (posters && posters.length > 0) {
            this.images = [
              ...posters.map(poster => poster.url),
              '/image/poster-4.jpg'
            ];
            console.log('Set images to:', this.images);
          } else {
            this.images = ['/image/poster-4.jpg'];
            console.log('No posters found for this community, using default image');
          }
        },
        (error) => {
          console.error('Error fetching posters for community:', {
            community: this.userCommunity,
            error: error
          });
          this.images = ['/image/poster-4.jpg'];
        }
      );
    },
    (error) => {
      console.error('Error fetching user profile:', {
        userId: userId,
        error: error
      });
      this.images = ['/image/poster-4.jpg'];
    });
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 5000); // Auto-slide every 5 seconds
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  selectSlide(index: number) {
    this.currentIndex = index;
    clearInterval(this.intervalId);
    this.startAutoSlide(); // Restart auto-slide
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
  
  handleImageError(event: any) {
    console.error('Image failed to load:', event);
    event.target.src = '/image/poster-4.jpg'; // Fallback image
  }
}