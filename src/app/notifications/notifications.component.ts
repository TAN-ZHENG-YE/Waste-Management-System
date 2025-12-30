import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../service/notification.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<NotificationsComponent>
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { communityName } = JSON.parse(userData);
      
      this.notificationService.loadNotifications(communityName).subscribe(response => {
        if (response && response.notifications) {
          this.notifications = response.notifications.sort((a: Notification, b: Notification) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      });
    }
  }



  deleteNotification(notification: Notification) {
    if (notification._id) {
      this.notificationService.deleteNotification(notification._id)
        .subscribe({
          next: () => {
            this.notifications = this.notifications.filter(n => n._id !== notification._id);
          },
          error: (error: any) => {
            console.error('Error deleting notification:', error);
          }
        });
    }
  }

  clearAll() {
    this.notificationService.clearAllNotifications()
      .subscribe({
        next: () => {
          this.notifications = [];
          console.log('All notifications cleared for the user');
        },
        error: (error: any) => {
          console.error('Error clearing notifications:', error);
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}