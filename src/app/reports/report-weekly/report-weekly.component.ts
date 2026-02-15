import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService, ReportData } from '../../core/services/data.service';

@Component({
  selector: 'app-report-weekly',
  standalone: false,
  templateUrl: './report-weekly.component.html',
  styleUrls: ['../report-shared.scss']
})
export class ReportWeeklyComponent implements OnInit, OnDestroy {
  @Output() reportGenerated = new EventEmitter<ReportData>();

  reportData: ReportData | null = null;
  isLoading = false;
  errorMessage = '';
  selectedStartDate: string;

  private subscription: Subscription | null = null;

  constructor(private dataService: DataService) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    this.selectedStartDate = monday.toISOString().split('T')[0];
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

    this.subscription = this.dataService.getWeeklyReport(this.selectedStartDate).subscribe({
      next: (data) => {
        this.reportData = data;
        this.reportGenerated.emit(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load weekly report';
        this.isLoading = false;
      }
    });
  }

  onDateChange(): void {
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
    console.log('Export weekly report - not implemented');
  }

  getReportTitle(): string {
    return 'Weekly Report';
  }

  getPeriodLabel(): string {
    if (this.reportData) {
      return `${this.formatDate(this.reportData.startDate)} - ${this.formatDate(this.reportData.endDate)}`;
    }
    return '';
  }
}
