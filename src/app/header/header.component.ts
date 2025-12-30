import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { NavigationStart, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProfileSettingsComponent } from '../profile-settings/profile-settings.component';
import { NotificationsComponent } from '../notifications/notifications.component';
import { ChangePasswordComponent } from '../change-password.component.ts/change-password.component';
import { NotificationService } from '../../service/notification.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    userStatus: string = 'guest';
    guestDenyList: Array<string> = ['/admin-dashboard', '/report-issues', '/schedule-pickup', '/view-history', '/view-report'];
    userDenyList: Array<string> = ['/admin-dashboard'];
    unreadNotifications: number = 0;

    constructor(
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        // Check initial state from local storage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            if (user && user.role) {
                this.userStatus = user.role;
            }
        }

        // Single subscription to auth status changes
        this.authService.getAuthStatusListener()
            .subscribe(user => {
                console.log('Auth status changed:', user);
                if (user && user.role) {
                    this.userStatus = user.role;                    
                    // Load notifications only when user is logged in
                    if (user.communityName) {
                        this.notificationService.loadNotifications(user.communityName);
                    }
                } else {
                    this.userStatus = 'guest';
                }
            });

        // add listener to check access
        this.router.events.subscribe(event => this.checkAccess(event));

        // Subscribe to notification updates
        this.notificationService.getUnreadCount().subscribe(count => {
            this.unreadNotifications = count;
        });
    }

    onLogout() {
        this.authService.logout();
        this.userStatus = 'guest';
        this.router.navigate(['/user-login']);
    }

    checkAccess(event: any) {
        // check event is NavigationStart
        if (!(event instanceof NavigationStart)) { return }

        // check if event.url starts with /#
        if (event.url.startsWith('/#')) { return }

        // Check current auth status from local storage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            this.userStatus = user.role;
        }

        // check if user is guest
        if (this.userStatus === 'guest' && this.guestDenyList.includes(event.url)) {
            alert('Please login to access this page.');
            this.router.navigateByUrl(this.router.url, { replaceUrl: true });
        }

        // check if user is user
        if (this.userStatus === 'user' && this.userDenyList.includes(event.url)) {
            alert('Please login as admin to access this page.');
            this.router.navigateByUrl(this.router.url, { replaceUrl: true });
        }
    }

    openProfileSettings() {
        this.dialog.open(ProfileSettingsComponent, {
            width: '500px'
        });
    }

    openNotifications() {
        const dialogRef = this.dialog.open(NotificationsComponent, {
            width: '90%',
            maxWidth: '800px',
            height: 'auto',
            maxHeight: '80vh',
            panelClass: 'notification-dialog'
        });

        dialogRef.afterClosed().subscribe(() => {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.communityName) {
                this.notificationService.loadNotifications(userData.communityName);
            }
        });
    }

    openChangePasswordDialog(): void {
        this.dialog.open(ChangePasswordComponent, {
            width: '400px'
        });
    }
}


