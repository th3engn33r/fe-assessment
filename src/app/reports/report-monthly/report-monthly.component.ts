import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService, ReportData } from '../../core/services/data.service';

@Component({
  selector: 'app-report-monthly',
  standalone: false,
  templateUrl: './report-monthly.component.html',
  styleUrls: ['../report-shared.scss']
})
export class ReportMonthlyComponent implements OnInit, OnDestroy {
  @Output() reportGenerated = new EventEmitter<ReportData>();

  reportData: ReportData | null = null;
  isLoading = false;
  errorMessage = '';
  selectedYear: number;
  selectedMonth: number;

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  private subscription: Subscription | null = null;

  constructor(private dataService: DataService) {
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedMonth = today.getMonth() + 1;
  }

  ngOnInit(): void {
    this.loadReport();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscription = this.dataService.getMonthlyReport(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.reportData = data;
        this.reportGenerated.emit(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load monthly report';
        this.isLoading = false;
      }
    });
  }

  onPeriodChange(): void {
    this.loadReport();
  }

  formatDate(date: string): string {
    return this.dataService.formatDate(date);
  }

  formatWeight(weight: number): string {
    return this.dataService.formatWeight(weight);
  }

  formatMilk(liters: number): string {
    return this.dataService.formatMilkProduction(liters);
  }

  printReport(): void {
    window.print();
  }

  exportReport(): void {
    console.log('Export monthly report - not implemented');
  }

  getReportTitle(): string {
    return 'Monthly Report';
  }

  getPeriodLabel(): string {
    const monthName = this.months.find(m => m.value === this.selectedMonth)?.label || '';
    return `${monthName} ${this.selectedYear}`;
  }
}
