import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService, ReportData } from '../../core/services/data.service';

@Component({
  selector: 'app-report-custom',
  standalone: false,
  templateUrl: './report-custom.component.html',
  styleUrls: ['../report-shared.scss']
})
export class ReportCustomComponent implements OnInit, OnDestroy {
  @Output() reportGenerated = new EventEmitter<ReportData>();

  reportData: ReportData | null = null;
  isLoading = false;
  errorMessage = '';
  startDate: string;
  endDate: string;

  private subscription: Subscription | null = null;

  constructor(private dataService: DataService) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    this.startDate = lastMonth.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
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
    if (!this.validateDateRange()) {
      this.errorMessage = 'End date must be after start date';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.subscription = this.dataService.getCustomReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.reportData = data;
        this.reportGenerated.emit(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load custom report';
        this.isLoading = false;
      }
    });
  }

  validateDateRange(): boolean {
    return this.dataService.validateDateRange(this.startDate, this.endDate);
  }

  onDateChange(): void {
    if (this.validateDateRange()) {
      this.loadReport();
    } else {
      this.errorMessage = 'End date must be after start date';
    }
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
    console.log('Export custom report - not implemented');
  }

  getReportTitle(): string {
    return 'Custom Report';
  }

  getPeriodLabel(): string {
    return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
  }
}
