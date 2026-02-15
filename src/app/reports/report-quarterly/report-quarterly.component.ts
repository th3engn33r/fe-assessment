import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService, ReportData } from '../../core/services/data.service';

@Component({
  selector: 'app-report-quarterly',
  standalone: false,
  templateUrl: './report-quarterly.component.html',
  styleUrls: ['../report-shared.scss']
})
export class ReportQuarterlyComponent implements OnInit, OnDestroy {
  @Output() reportGenerated = new EventEmitter<ReportData>();

  reportData: ReportData | null = null;
  isLoading = false;
  errorMessage = '';
  selectedYear: number;
  selectedQuarter: number;

  quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ];

  private subscription: Subscription | null = null;

  constructor(private dataService: DataService) {
    const today = new Date();
    this.selectedYear = today.getFullYear();
    this.selectedQuarter = Math.ceil((today.getMonth() + 1) / 3);
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

    this.subscription = this.dataService.getQuarterlyReport(this.selectedYear, this.selectedQuarter).subscribe({
      next: (data) => {
        this.reportData = data;
        this.reportGenerated.emit(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load quarterly report';
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
    console.log('Export quarterly report - not implemented');
  }

  getReportTitle(): string {
    return 'Quarterly Report';
  }

  getPeriodLabel(): string {
    const quarterLabel = this.quarters.find(q => q.value === this.selectedQuarter)?.label || '';
    return `${quarterLabel} ${this.selectedYear}`;
  }
}
