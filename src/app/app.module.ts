import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterModule } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

import { FilterWasteTypePipe } from '../pipe/filter-waste-type.pipe';
import { AuthService } from '../service/auth.service';
import { UserActionService } from '../service/userAction.service';
import { UserProfileService } from '../service/userProfile.service';
import { AboutUsComponent } from './about-us/about-us.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AnnouncementsComponent } from './admin/announcements/announcements.component';
import { CommunityManagementComponent } from './admin/community-management/community-management.component';
import { IssuesComponent } from './admin/issues/issues.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChangePasswordComponent } from './change-password.component.ts/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HeaderComponent } from './header/header.component';
import { UserLoginComponent } from './login/user-login.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { HomepageComponent } from './user/homepage/homepage.component';
import { ReportIssueComponent } from './user/report-issue/report-issue.component';
import { SchedulePickupComponent } from './user/schedule-pickup/schedule-pickup.component';
import { ViewHistoryComponent } from './user/view-history/view-history.component';
import { ViewReportComponent } from './user/view-report/view-report.component';
import { CommunityService } from '../service/community.service';
import { NotificationService } from '../service/notification.service';
import { PickupRequestsComponent } from './admin/pickup-requests/pickup-requests.component';


@NgModule({
    declarations: [
        FilterWasteTypePipe,
        AppComponent,
        HeaderComponent,
        SchedulePickupComponent,
        ViewHistoryComponent,
        ViewReportComponent,
        AboutUsComponent,
        RegisterComponent,
        UserLoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        ReportIssueComponent,
        HomepageComponent,
        AdminDashboardComponent,
        CommunityManagementComponent,
        UserManagementComponent,
        ReportsComponent,
        AnnouncementsComponent,
        ProfileSettingsComponent,
        NotificationsComponent,
        SidebarComponent,
        IssuesComponent,
        ChangePasswordComponent,
        PickupRequestsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RouterModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatInputModule,
        MatCardModule,
        MatPaginatorModule,
        MatChipsModule,
        MatSelectModule,
        MatMenuModule,
        ReactiveFormsModule,
        BaseChartDirective,
        HttpClientModule,
        FormsModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatBadgeModule,
        MatDividerModule,
        CommonModule
    ],
    providers: [
        provideAnimationsAsync(),
        provideNativeDateAdapter(),
        provideCharts(withDefaultRegisterables()),
        AuthService,
        UserActionService,
        UserProfileService,
        CommunityService,
        NotificationService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }





