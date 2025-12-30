import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { UserActionService } from '../../../service/userAction.service';

@Component({
    selector: 'app-history',
    templateUrl: './view-history.component.html',
    styleUrl: './view-history.component.css'
})
export class ViewHistoryComponent implements OnInit {
    wasteTypes: string[] = ['Household Waste', 'Recyclable Waste', 'Hazardous Waste', 'Electronics Waste']
    startIndex: number = 0;
    endIndex: number = 10;
    list: any[] = [];

    constructor(private userActionService: UserActionService) { }

    ngOnInit() {
        this.userActionService.viewHistory()
            .then((res) => {
                this.list = res.data;
            })
            .catch((err) => {
                console.error('Error fetching history:', err);
                alert(err);
            });
    }

    handlePageEvent(event: PageEvent) {
        this.startIndex = event.pageIndex * event.pageSize;
        this.endIndex = this.startIndex + event.pageSize;
    }
}
