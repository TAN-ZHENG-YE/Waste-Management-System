import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserActionService {
    private apiUrl = environment.apiUrl;

    constructor(private httpClient: HttpClient, private authService: AuthService) { }

    public async schedulePickup(data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const user = this.authService.getUser();
            data.userId = user._id;
            data.communityName = user.communityName;

            this.httpClient.post(`${this.apiUrl}/user/schedulePickup`, data)
                .subscribe({
                    next: resolve,
                    error: (err) => reject(err.error.err || 'Server error')
                });
        });
    }

    public async viewHistory(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const user = this.authService.getUser();

            this.httpClient.get(`${this.apiUrl}/user/viewHistory/${user._id}`)
                .subscribe({
                    next: resolve,
                    error: (err) => reject(err.error.err || 'Server error')
                });
        });
    }

    public async reportIssue(data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const user = this.authService.getUser();
            data.userName = user.fullName;
            data.communityName = user.communityName;

            const fileReader = new FileReader();
            fileReader.onload = (event: any) => {
                const base64String = event.target.result;
                data.photo = base64String;

                this.httpClient.post(`${this.apiUrl}/user/reportIssue`, data)
                    .subscribe({
                        next: resolve,
                        error: (err) => reject(err.error.err || 'Server error')
                    });
            };
            fileReader.onerror = (err) => {
                console.error(err);
                reject("Unable to process image");
            };
            fileReader.readAsDataURL(data.photo);
        });
    }

    public async viewReport(category: any): Promise<any> {
        const community = this.authService.getUser().communityName;

        return new Promise<any>((resolve, reject) => {
            this.httpClient.get(`${this.apiUrl}/user/statistics/${community}/${category}`)
                .subscribe({
                    next: resolve,
                    error: (err) => reject(err.error.err || 'Server error')
                });
        });
    }
}
