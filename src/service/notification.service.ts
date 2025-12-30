import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface Notification {
  _id?: string;
  type: 'announcement' | 'admin_message' | 'pickup_status';
  message: string;
  communityName: string;
  targetUsers: string[];
  deletedBy: string[];
  createdAt: Date;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api';
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.initializeNotifications();
  }

  private initializeNotifications() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user && user.communityName && user.role !== 'admin') {
      this.loadNotifications(user.communityName).subscribe();
    }
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  loadNotifications(communityName: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.unreadCount.next(0);
      return of([]);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<{notifications: Notification[]}>(
      `${this.apiUrl}/notifications/${communityName}`, 
      { headers }
    ).pipe(
      tap(response => {
        const notifications = response.notifications || [];
        this.notifications.next(notifications);
        const unreadCount = notifications.length;
        this.unreadCount.next(unreadCount);
      }),
      catchError(error => {
        console.error('Error loading notifications:', error);
        this.unreadCount.next(0);
        return of([]);
      })
    );
  }

  sendCommunityNotification(notification: Omit<Notification, '_id'>): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/notifications`, notification, { headers });
  }

  deleteNotification(notificationId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/delete`, {}, { headers })
      .pipe(
        tap(() => {
          const currentNotifications = this.notifications.value;
          const updatedNotifications = currentNotifications.filter(n => n._id !== notificationId);
          this.notifications.next(updatedNotifications);
          this.updateUnreadCount(updatedNotifications);
        })
      );
  }

  clearAllNotifications(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.apiUrl}/notifications/clearAll`, {}, { headers });
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.length;
    this.unreadCount.next(unreadCount);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
} 