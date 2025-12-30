import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserProfile(headers: HttpHeaders): Observable<any> {
    const user = this.authService.getUser();
    if (!user) {
      throw new Error('User not logged in');
    }
    return this.http.get(`${this.apiUrl}/user/profile/${user._id}`, { headers });
  }

  updateUserProfile(data: any, options: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile/${data.userId}`, data, options);
  }

  changePassword(data: any, headers: any): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('userData') || '{}')._id;
    return this.http.put(`${this.apiUrl}/user/changePassword/${userId}`, data, { headers });
  }

  getAdminProfile() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/admin/profile`, { headers });
  }
} 