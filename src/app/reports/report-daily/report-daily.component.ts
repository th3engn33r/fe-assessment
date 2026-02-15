import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService, ReportData } from '../../core/services/data.service';

@Component({
  selector: 'app-report-daily',
  standalone: false,
  templateUrl: './report-daily.component.html',
  styleUrls: ['../report-shared.scss']
})
export class ReportDailyComponent implements OnInit, OnDestroy {
  @Output() reportGenerated = new EventEmitter<ReportData>();

  reportData: ReportData | null = null;
  isLoading = false;
  errorMessage = '';
  selectedDate: string;

  private subscription: Subscription | null = null;

  constructor(private dataService: DataService) {
    this.selectedDate = new Date().toISOString().split('T')[0];
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

    this.subscription = this.dataService.getDailyReport(this.selectedDate).subscribe({
      next: (data) => {
        this.reportData = data;
        this.reportGenerated.emit(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load daily report';
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
    console.log('Export daily report - not implemented');
  }

  getReportTitle(): string {
    return 'Daily Report';
  }

  getPeriodLabel(): string {
    return this.formatDate(this.selectedDate);
  }
}
