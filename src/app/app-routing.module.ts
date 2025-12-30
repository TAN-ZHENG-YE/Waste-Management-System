import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HomepageComponent } from './user/homepage/homepage.component';
import { ReportIssueComponent } from './user/report-issue/report-issue.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SchedulePickupComponent } from './user/schedule-pickup/schedule-pickup.component';
import { UserLoginComponent } from './login/user-login.component';
import { RegisterComponent } from './register/register.component';
import { ViewHistoryComponent } from './user/view-history/view-history.component';
import { ViewReportComponent } from './user/view-report/view-report.component';

const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full' }, // Default route
    { path: 'homepage', component: HomepageComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'user-login', component: UserLoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'report-issues', component: ReportIssueComponent },
    { path: "schedule-pickup", component: SchedulePickupComponent },
    { path: "view-history", component: ViewHistoryComponent },
    { path: "view-report", component: ViewReportComponent },
    { path: "about-us", component: AboutUsComponent }

];

@NgModule({
    imports: [RouterModule.forRoot(routes, { anchorScrolling: "enabled" })],
    exports: [RouterModule]
})
export class AppRoutingModule { }









