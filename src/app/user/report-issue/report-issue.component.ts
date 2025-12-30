import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserActionService } from '../../../service/userAction.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-report-issue',
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.css']
})
export class ReportIssueComponent {
    uploadForm: FormGroup;
    selectedFile: File | null = null;

    issueTypes: string[] = ['Missed Pickup', 'Overflowing Bin', 'Illegal Dumping', 'Others'];

  constructor(private fb: FormBuilder, private userActionService: UserActionService) {
    this.uploadForm = this.fb.group({
      issueType: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      photo: [null, Validators.required]
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.uploadForm.patchValue({
        photo: this.selectedFile
      });
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) {
      alert('Please fill out all required fields and upload a photo.');
      return;
    }

    const issueData = {
      ...this.uploadForm.value
    };

    this.userActionService.reportIssue(issueData)
      .then(() => {
        this.uploadForm.reset();
        alert('Report issue successfully submitted!');
      })
      .catch((error) => {
        alert(error);
      });
  }
}


