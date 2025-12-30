import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-change-password',
  template: `
    <div *ngIf="!showConfirmation" class="change-password-container">
      <h2 mat-dialog-title>Change Password</h2>
      <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Current Password</mat-label>
          <input matInput type="password" formControlName="currentPassword">
          <mat-error *ngIf="changePasswordForm.get('currentPassword')?.hasError('required')">
            Current password is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>New Password</mat-label>
          <input matInput type="password" formControlName="newPassword">
          <mat-error *ngIf="changePasswordForm.get('newPassword')?.hasError('required')">
            New password is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Confirm New Password</mat-label>
          <input matInput type="password" formControlName="confirmPassword">
          <mat-error *ngIf="changePasswordForm.get('confirmPassword')?.hasError('required')">
            Please confirm your new password
          </mat-error>
          <mat-error *ngIf="changePasswordForm.hasError('passwordMismatch')">
            Passwords do not match
          </mat-error>
        </mat-form-field>

        <div class="button-container">
          <button mat-raised-button color="primary" type="submit" [disabled]="changePasswordForm.invalid">
            Change Password
          </button>
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Confirmation Dialog -->
    <div *ngIf="showConfirmation" class="confirmation-dialog">
      <h2 mat-dialog-title>Confirm Password Change</h2>
      <mat-dialog-content>
        Are you sure you want to change your password?
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="cancelConfirmation()">Cancel</button>
        <button mat-raised-button color="primary" (click)="confirmPasswordChange()">
          Confirm Change
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .change-password-container {
      padding: 20px;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .button-container {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .confirmation-dialog {
      padding: 20px;
    }
    mat-dialog-content {
      margin: 20px 0;
    }
    mat-dialog-actions {
      margin-top: 20px;
    }
  `]
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  showConfirmation = false;
  private passwordData: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private authService: AuthService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.passwordData = {
        currentPassword: this.changePasswordForm.get('currentPassword')?.value,
        newPassword: this.changePasswordForm.get('newPassword')?.value
      };
      this.showConfirmation = true;
    }
  }

  confirmPasswordChange() {
    // Proceed with password change
    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        alert('Password changed successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to change password');
        this.showConfirmation = false;
      }
    });
  }

  cancelConfirmation() {
    this.showConfirmation = false;
    this.passwordData = null;
  }

  onCancel() {
    this.dialogRef.close();
  }
}
