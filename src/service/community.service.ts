import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommunityService {
  private apiUrl = environment.apiUrl;
  private communityDetailsSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  getCommunityDetails(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.get(`${this.apiUrl}/admin/communityDetails`, { headers })
      .pipe(
        tap(details => this.communityDetailsSubject.next(details))
      );
  }

  updateCommunityDetails(details: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.put(`${this.apiUrl}/admin/communityDetails`, details, { headers })
      .pipe(
        tap(updatedDetails => this.communityDetailsSubject.next(updatedDetails))
      );
  }

  getCommunityDetailsListener() {
    return this.communityDetailsSubject.asObservable();
  }
} 