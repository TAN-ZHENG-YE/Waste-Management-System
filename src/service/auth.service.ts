import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api';
    private authStatusListener = new Subject<any>();
    private user: any = null;
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser = this.currentUserSubject.asObservable();

    constructor(private httpClient: HttpClient, private router: Router, private notificationService: NotificationService) {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUserSubject.next(JSON.parse(userData));
        }

        window.addEventListener('storage', (event) => {
            if (event.key === 'authToken' && !event.newValue) {
                this.logout();
            }
        });
    }

    private verifyToken(token: string) {
        return this.httpClient.get(`${this.apiUrl}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    storeUserData(token: string, userData: any) {
        try {
            if (!userData || !userData.role) {
                return;
            }
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            this.user = userData;
            this.authStatusListener.next(userData);
        } catch (error) {
            console.error('Error storing auth data:', error);
            this.logout();
        }
    }

    public setUser(status: any) {
        if (!status || !status.role) {
            this.user = null;
            this.authStatusListener.next(null);
            return;
        }
        this.user = status;
        this.authStatusListener.next(status);
    }

    public getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    public getUser(): any {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    public getAuthHeaders(): { [key: string]: string } {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    public async register(userData: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.httpClient.post(`${this.apiUrl}/user/register`, userData)
            .subscribe({ next: resolve, error: (err) => reject(err.error?.err || 'Registration failed') })
        })
    }

    public login(email: string, password: string): Observable<any> {
        return this.httpClient.post<any>(`${this.apiUrl}/user/login`, { email, password })
            .pipe(
                map(response => {
                    if (response && response.token) {
                        localStorage.setItem('currentUser', JSON.stringify(response.data));
                        localStorage.setItem('token', response.token);
                        this.currentUserSubject.next(response.data);
                        
                        if (response.data.communityName && response.data.role !== 'admin') {
                            this.notificationService.loadNotifications(response.data.communityName).subscribe();
                        } else {
                            this.notificationService.loadNotifications('').subscribe();
                        }
                    }
                    return response;
                }),
                catchError(error => {
                    console.error('Login error:', error);
                    if (error.error && error.error.err) {
                        return throwError(() => new Error(error.error.err));
                    }
                    return throwError(() => new Error('Login failed. Please try again.'));
                })
            );
    }

    public logout(): void {
        // Clear all auth-related data
        this.setUser(null);
        localStorage.clear();
        this.currentUserSubject.next(null);
        this.authStatusListener.next(null);
        
        // Navigate to homepage first
        this.router.navigate(['/homepage']).then(() => {
            // Then reload the page
            window.location.reload();
        });
    }

    public requestPasswordReset(email: string) {
        return this.httpClient.post(`${this.apiUrl}/auth/forgot-password`, { email });
    }

    public resetPassword(token: string, newPassword: string) {
        return this.httpClient.post(`${this.apiUrl}/auth/reset-password`, {
            token,
            newPassword
        });
    }

    public validateResetToken(token: string) {
        return this.httpClient.get(`${this.apiUrl}/auth/validate-reset-token/${token}`);
    }

    public changePassword(data: { currentPassword: string, newPassword: string }) {
        return this.httpClient.post(`${this.apiUrl}/user/change-password`, data, {
            headers: this.getAuthHeaders()
        });
    }
}
