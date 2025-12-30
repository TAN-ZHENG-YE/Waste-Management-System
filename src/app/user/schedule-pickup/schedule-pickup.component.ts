import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserActionService } from '../../../service/userAction.service';

@Component({
    selector: 'app-pickup',
    templateUrl: './schedule-pickup.component.html',
    styleUrl: './schedule-pickup.component.css'
})
export class SchedulePickupComponent {
    private _snackBar = inject(MatSnackBar);
    wasteTypes: string[] = ['Household Waste', 'Recyclable Waste', 'Hazardous Waste', 'Electronics Waste']
    submitOnce = false;
    minDate = new Date();

    constructor(private userActionService: UserActionService) { }

    dayOfWeekFilter = (d: Date | null): boolean => {
        const day = (d || new Date()).getDay();
        return (day == 1 || day == 4);
    };

    scheduleForm = new FormGroup({
        date: new FormControl<Date | null>(null, Validators.required),
        wasteType: buildFormGroupFromArray(this.wasteTypes),
        note: new FormControl('')
    });

    onSubmit() {
        this.submitOnce = true;
        if (this.scheduleForm.invalid) {
            return;
        }

        const formData: any = this.scheduleForm.value

        const pickupData = {
            ...formData,
            wasteType: Object.keys(formData.wasteType)
                .filter(key => formData.wasteType[key])
        };

        this.userActionService.schedulePickup(pickupData)
            .then(() => {
                this.scheduleForm.reset();
                this._snackBar.open('Pickup Scheduled', 'Close', { duration: 5000 });
            })
            .catch((error) => {
                console.error('Error scheduling pickup:', error);
                this._snackBar.open(error, 'Close', { duration: 5000 });
            });
    }
}

function buildFormGroupFromArray(array: any[]) {
    const newFormGroup = new FormGroup({}, checkboxValidator());
    array.forEach(item => {
        newFormGroup.addControl(item, new FormControl({ value: false, disabled: false }));
    });
    return newFormGroup;
}

function checkboxValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const selected = Object.values(control.value).some(value => value);
        return selected ? null : { noSelectedValues: true };
    };
}