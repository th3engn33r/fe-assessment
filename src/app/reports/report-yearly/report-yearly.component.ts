import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService, ReportData } from '../../core/services/data.service';

@Component({
  selector: 'app-report-yearly',
  standalone: false,
  templateUrl: './report-yearly.component.html',
  styleUrls: ['../report-shared.scss']
})
export class ReportYearlyComponent implements OnInit, OnDestroy {
  @Output() reportGenerated = new EventEmitter<ReportData>();

  reportData: ReportData | null = null;
  isLoading = false;
  errorMessage = '';
  selectedYear: number;

  private subscription: Subscription | null = null;

  constructor(private dataService: DataService) {
    this.selectedYear = new Date().getFullYear();
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

    this.subscription = this.dataService.getYearlyReport(this.selectedYear).subscribe({
      next: (data) => {
        this.reportData = data;
        this.reportGenerated.emit(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load yearly report';
        this.isLoading = false;
      }
    });
  }

  onYearChange(): void {
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
    console.log('Export yearly report - not implemented');
  }

  getReportTitle(): string {
    return 'Yearly Report';
  }

  getPeriodLabel(): string {
    return `${this.selectedYear}`;
  }
}
