import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chart, ChartTypeRegistry } from 'chart.js';
import { UserActionService } from '../../../service/userAction.service';

@Component({
    selector: 'app-report',
    templateUrl: './view-report.component.html',
    styleUrl: './view-report.component.css'
})
export class ViewReportComponent {
    // Chart setting
    chartTitle: string = '';
    chartType: keyof ChartTypeRegistry = 'line';
    chartData: any[] = [];
    chartLabels: string[] = [];
    chartColors: String = "";
    chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false
    };

    constructor(private userActionService: UserActionService) { }

    filterForm = new FormGroup({
        reportType: new FormControl('', Validators.required),
    });

    generateReport() {
        const category = this.filterForm.value.reportType as string
        switch (category) {
            case 'pickupStatistics':
                this.chartTitle = 'Pickup Statistics';
                this.chartType = 'line';
                this.chartColors = "rgb(75, 192, 192)";
                this.chartOptions.scales = { y: { beginAtZero: true } };
                break;

            case 'issueStatistics':
                this.chartTitle = 'Issues Reported';
                this.chartType = 'pie';
                this.chartColors = "";
                this.chartOptions.scales = {};
                break;

            case 'recyclingRates':
                this.chartTitle = 'Recycling Rates';
                this.chartType = 'bar';
                this.chartColors = "";
                this.chartOptions.scales = { y: { beginAtZero: true, max: 100 } };
                break;

            case 'communityActiveMembers':
                this.chartTitle = 'Community Active Members';
                this.chartType = 'line';
                this.chartColors = "rgb(255, 99, 132)";
                this.chartOptions.scales = { y: { beginAtZero: true } };
                break;
        }

        this.userActionService.viewReport(category)
            .then((res) => { this.generateChart(res.data[category]) })
            .catch((err) => alert(err));
    }

    generateChart(data: any[]) {
        this.chartLabels = data.map(item => item.label);
        this.chartData = [
            {
                data: data.map(item => item.value),
                label: this.chartTitle,
                borderColor: this.chartColors
            }
        ];
    }
}
