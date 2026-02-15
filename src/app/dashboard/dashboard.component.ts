import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService, Animal, FarmStats, DashboardWidget } from '../core/services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  animals: any[] = [];
  stats: any = null;
  widgets: any[] = [];
  recentAlerts: any[] = [];

  private subscriptions: Subscription[] = [];
  private animalsSubscription: Subscription | null = null;
  private statsSubscription: Subscription | null = null;

  isLoading = false;
  errorMessage = '';
  searchFilter = '';
  selectedView: 'grid' | 'list' = 'grid';
  lastUpdated: Date | null = null;

  sortField = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  pageSize = 5;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.animalsSubscription) {
      this.animalsSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.animalsSubscription = this.dataService.getAnimals().subscribe({
      next: (animals) => {
        this.animals = animals;
        this.lastUpdated = new Date();

        this.statsSubscription = this.dataService.getStats().subscribe({
          next: (stats) => {
            this.stats = stats;

            this.dataService.getDashboardWidgets().subscribe({
              next: (widgets) => {
                this.widgets = widgets;
                this.processWidgetData();
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Error loading widgets:', err);
                this.isLoading = false;
              }
            });
          },
          error: (err) => {
            this.errorMessage = 'Failed to load statistics';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load animals';
        this.isLoading = false;
      }
    });
  }

  processWidgetData(): void {
    this.widgets = this.widgets.map(widget => {
      if (widget.type === 'stats') {
        widget.data = this.stats;
      } else if (widget.type === 'list') {
        widget.data = this.getHealthAlerts();
      } else if (widget.type === 'chart') {
        widget.data = this.getMilkProductionData();
      }
      return widget;
    });
  }

  getHealthAlerts(): any[] {
    return this.animals
      .filter(animal => animal.healthStatus !== 'Healthy')
      .map(animal => ({
        id: animal.id,
        name: animal.name,
        status: animal.healthStatus,
        alert: this.getAlertMessage(animal),
        severity: this.getAlertSeverity(animal.healthStatus)
      }));
  }

  private getAlertMessage(animal: any): string {
    switch (animal.healthStatus) {
      case 'Sick':
        return `${animal.name} requires immediate attention`;
      case 'Under Observation':
        return `${animal.name} is being monitored`;
      default:
        return `${animal.name} status: ${animal.healthStatus}`;
    }
  }

  private getAlertSeverity(status: string): string {
    switch (status) {
      case 'Sick':
        return 'high';
      case 'Under Observation':
        return 'medium';
      default:
        return 'low';
    }
  }

  getMilkProductionData(): any {
    const dairyCows = this.animals.filter(a => a.type === 'Dairy Cow');
    return {
      labels: dairyCows.map(c => c.name),
      values: dairyCows.map(c => c.milkProduction || 0),
      total: dairyCows.reduce((sum, c) => sum + (c.milkProduction || 0), 0)
    };
  }

  sortAnimals(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.animals = [...this.animals].sort((a, b) => {
      let comparison = 0;
      const aValue = a[field];
      const bValue = b[field];

      if (typeof aValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue - bValue;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  get filteredAnimals(): any[] {
    if (!this.searchFilter) {
      return this.paginatedAnimals;
    }
    const filter = this.searchFilter.toLowerCase();
    const filtered = this.animals.filter(animal =>
      animal.name.toLowerCase().includes(filter) ||
      animal.type.toLowerCase().includes(filter) ||
      animal.healthStatus.toLowerCase().includes(filter)
    );
    return this.paginateArray(filtered);
  }

  get paginatedAnimals(): any[] {
    return this.paginateArray(this.animals);
  }

  private paginateArray(arr: any[]): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return arr.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.animals.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  refreshData(): void {
    this.ngOnInit();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.dataService.setFilter(this.searchFilter);
  }

  toggleView(): void {
    this.selectedView = this.selectedView === 'grid' ? 'list' : 'grid';
  }

  selectAnimal(animal: Animal): void {
    this.dataService.selectAnimal(animal);
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

  // TODO: Implement export functionality
  exportDashboard(): void {
    console.log('Export not yet implemented');
  }
}
