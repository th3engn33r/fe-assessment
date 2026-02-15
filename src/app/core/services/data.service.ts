import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';

export interface Animal {
  id: number;
  name: string;
  type: string;
  birthDate: string;
  weight: number;
  healthStatus: string;
  lastCheckup: string;
  milkProduction?: number;
  feedConsumption?: number;
  notes?: string;
}

export interface FarmStats {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  totalMilkProduction: number;
  averageWeight: number;
  feedEfficiency: number;
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ReportData {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  animals: Animal[];
  stats: FarmStats;
  generatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  data: FarmStats | HealthAlert[] | MilkProductionData | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type HealthStatus = 'Healthy' | 'Sick' | 'Under Observation';

export interface HealthAlert {
  id: number;
  name: string;
  status: string;
  alert: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MilkProductionData {
  labels: string[];
  values: number[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private animalsSubject = new BehaviorSubject<Animal[]>([]);
  private statsSubject = new BehaviorSubject<FarmStats | null>(null);
  private loadingSubject = new Subject<boolean>();
  private errorSubject = new Subject<string>();

  private readonly selectedAnimalSignal = signal<Animal | null>(null);
  private readonly filterSignal = signal<string>('');

  private cache: any = {};
  private cacheExpiry: any = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  private localAnimals: Animal[] = [];
  private lastFetchTime: number = 0;

  public animals$ = this.animalsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private apiUrl = 'https://api.farm-dashboard.example.com';

  constructor(private http: HttpClient) {
    this.initializeFromLocalStorage();
  }

  private initializeFromLocalStorage(): void {
    try {
      const savedAnimals = localStorage.getItem('farm_animals');
      if (savedAnimals) {
        this.localAnimals = JSON.parse(savedAnimals);
        this.animalsSubject.next(this.localAnimals);
      }

      const savedStats = localStorage.getItem('farm_stats');
      if (savedStats) {
        this.statsSubject.next(JSON.parse(savedStats));
      }

      const savedCache = localStorage.getItem('farm_cache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
      }

      const savedCacheExpiry = localStorage.getItem('farm_cache_expiry');
      if (savedCacheExpiry) {
        this.cacheExpiry = JSON.parse(savedCacheExpiry);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  getAnimals(): Observable<Animal[]> {
    this.loadingSubject.next(true);

    if (this.isCacheValid('animals')) {
      this.loadingSubject.next(false);
      return of(this.cache['animals']);
    }

    return this.getMockAnimals().pipe(
      tap(animals => {
        this.localAnimals = animals;
        this.animalsSubject.next(animals);
        this.setCache('animals', animals);
        this.saveToLocalStorage('farm_animals', animals);
        this.loadingSubject.next(false);
        this.lastFetchTime = Date.now();
      }),
      catchError(err => {
        this.errorSubject.next('Failed to fetch animals');
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }

  getAnimalById(id: number): Observable<Animal | undefined> {
    return this.getAnimals().pipe(
      map(animals => animals.find(a => a.id === id))
    );
  }

  addAnimal(animal: Partial<Animal>): Observable<Animal> {
    const newAnimal: Animal = {
      id: this.generateId(),
      name: animal.name || 'Unknown',
      type: animal.type || 'Cow',
      birthDate: animal.birthDate || new Date().toISOString(),
      weight: animal.weight || 0,
      healthStatus: animal.healthStatus || 'Healthy',
      lastCheckup: animal.lastCheckup || new Date().toISOString(),
      milkProduction: animal.milkProduction,
      feedConsumption: animal.feedConsumption,
      notes: animal.notes
    };

    this.localAnimals.push(newAnimal);
    this.animalsSubject.next([...this.localAnimals]);
    this.saveToLocalStorage('farm_animals', this.localAnimals);
    this.invalidateCache('animals');
    this.recalculateStats();

    return of(newAnimal);
  }

  updateAnimal(id: number, updates: Partial<Animal>): Observable<Animal | null> {
    const index = this.localAnimals.findIndex(a => a.id === id);
    if (index === -1) {
      return of(null);
    }

    this.localAnimals[index] = { ...this.localAnimals[index], ...updates };
    this.animalsSubject.next([...this.localAnimals]);
    this.saveToLocalStorage('farm_animals', this.localAnimals);
    this.invalidateCache('animals');
    this.recalculateStats();

    return of(this.localAnimals[index]);
  }

  deleteAnimal(id: number): Observable<boolean> {
    const index = this.localAnimals.findIndex(a => a.id === id);
    if (index === -1) {
      return of(false);
    }

    this.localAnimals.splice(index, 1);
    this.animalsSubject.next([...this.localAnimals]);
    this.saveToLocalStorage('farm_animals', this.localAnimals);
    this.invalidateCache('animals');
    this.recalculateStats();

    return of(true);
  }

  getStats(): Observable<FarmStats> {
    this.loadingSubject.next(true);

    if (this.isCacheValid('stats')) {
      this.loadingSubject.next(false);
      return of(this.cache['stats']);
    }

    return this.getAnimals().pipe(
      map(animals => this.calculateStats(animals)),
      tap(stats => {
        this.statsSubject.next(stats);
        this.setCache('stats', stats);
        this.saveToLocalStorage('farm_stats', stats);
        this.loadingSubject.next(false);
      })
    );
  }

  private calculateStats(animals: Animal[]): FarmStats {
    const healthyAnimals = animals.filter(a => a.healthStatus === 'Healthy').length;
    const totalMilk = animals.reduce((sum, a) => sum + (a.milkProduction || 0), 0);
    const totalWeight = animals.reduce((sum, a) => sum + a.weight, 0);
    const totalFeed = animals.reduce((sum, a) => sum + (a.feedConsumption || 0), 0);

    return {
      totalAnimals: animals.length,
      healthyAnimals,
      sickAnimals: animals.length - healthyAnimals,
      totalMilkProduction: totalMilk,
      averageWeight: animals.length > 0 ? totalWeight / animals.length : 0,
      feedEfficiency: totalFeed > 0 ? totalMilk / totalFeed : 0
    };
  }

  private recalculateStats(): void {
    const stats = this.calculateStats(this.localAnimals);
    this.statsSubject.next(stats);
    this.invalidateCache('stats');
  }

  getDailyReport(date: string): Observable<ReportData> {
    this.loadingSubject.next(true);
    const cacheKey = `report_daily_${date}`;

    if (this.isCacheValid(cacheKey)) {
      this.loadingSubject.next(false);
      return of(this.cache[cacheKey]);
    }

    return this.getAnimals().pipe(
      map(animals => {
        const report: ReportData = {
          period: 'daily',
          startDate: date,
          endDate: date,
          animals: this.filterAnimalsByDate(animals, date, date),
          stats: this.calculateStats(animals),
          generatedAt: new Date().toISOString()
        };
        return report;
      }),
      tap(report => {
        this.setCache(cacheKey, report);
        this.loadingSubject.next(false);
      })
    );
  }

  getWeeklyReport(startDate: string): Observable<ReportData> {
    this.loadingSubject.next(true);
    const endDate = this.addDays(startDate, 7);
    const cacheKey = `report_weekly_${startDate}`;

    if (this.isCacheValid(cacheKey)) {
      this.loadingSubject.next(false);
      return of(this.cache[cacheKey]);
    }

    return this.getAnimals().pipe(
      map(animals => {
        const report: ReportData = {
          period: 'weekly',
          startDate: startDate,
          endDate: endDate,
          animals: this.filterAnimalsByDate(animals, startDate, endDate),
          stats: this.calculateStats(animals),
          generatedAt: new Date().toISOString()
        };
        return report;
      }),
      tap(report => {
        this.setCache(cacheKey, report);
        this.loadingSubject.next(false);
      })
    );
  }

  getMonthlyReport(year: number, month: number): Observable<ReportData> {
    this.loadingSubject.next(true);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = this.getLastDayOfMonth(year, month);
    const cacheKey = `report_monthly_${year}_${month}`;

    if (this.isCacheValid(cacheKey)) {
      this.loadingSubject.next(false);
      return of(this.cache[cacheKey]);
    }

    return this.getAnimals().pipe(
      map(animals => {
        const report: ReportData = {
          period: 'monthly',
          startDate: startDate,
          endDate: endDate,
          animals: this.filterAnimalsByDate(animals, startDate, endDate),
          stats: this.calculateStats(animals),
          generatedAt: new Date().toISOString()
        };
        return report;
      }),
      tap(report => {
        this.setCache(cacheKey, report);
        this.loadingSubject.next(false);
      })
    );
  }

  getQuarterlyReport(year: number, quarter: number): Observable<ReportData> {
    this.loadingSubject.next(true);
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = this.getLastDayOfMonth(year, endMonth);
    const cacheKey = `report_quarterly_${year}_${quarter}`;

    if (this.isCacheValid(cacheKey)) {
      this.loadingSubject.next(false);
      return of(this.cache[cacheKey]);
    }

    return this.getAnimals().pipe(
      map(animals => {
        const report: ReportData = {
          period: 'quarterly',
          startDate: startDate,
          endDate: endDate,
          animals: this.filterAnimalsByDate(animals, startDate, endDate),
          stats: this.calculateStats(animals),
          generatedAt: new Date().toISOString()
        };
        return report;
      }),
      tap(report => {
        this.setCache(cacheKey, report);
        this.loadingSubject.next(false);
      })
    );
  }

  getYearlyReport(year: number): Observable<ReportData> {
    this.loadingSubject.next(true);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const cacheKey = `report_yearly_${year}`;

    if (this.isCacheValid(cacheKey)) {
      this.loadingSubject.next(false);
      return of(this.cache[cacheKey]);
    }

    return this.getAnimals().pipe(
      map(animals => {
        const report: ReportData = {
          period: 'yearly',
          startDate: startDate,
          endDate: endDate,
          animals: this.filterAnimalsByDate(animals, startDate, endDate),
          stats: this.calculateStats(animals),
          generatedAt: new Date().toISOString()
        };
        return report;
      }),
      tap(report => {
        this.setCache(cacheKey, report);
        this.loadingSubject.next(false);
      })
    );
  }

  getCustomReport(startDate: string, endDate: string): Observable<ReportData> {
    this.loadingSubject.next(true);
    const cacheKey = `report_custom_${startDate}_${endDate}`;

    if (this.isCacheValid(cacheKey)) {
      this.loadingSubject.next(false);
      return of(this.cache[cacheKey]);
    }

    return this.getAnimals().pipe(
      map(animals => {
        const report: ReportData = {
          period: 'custom',
          startDate: startDate,
          endDate: endDate,
          animals: this.filterAnimalsByDate(animals, startDate, endDate),
          stats: this.calculateStats(animals),
          generatedAt: new Date().toISOString()
        };
        return report;
      }),
      tap(report => {
        this.setCache(cacheKey, report);
        this.loadingSubject.next(false);
      })
    );
  }

  getDashboardWidgets(): Observable<DashboardWidget[]> {
    const cacheKey = 'dashboard_widgets';

    if (this.isCacheValid(cacheKey)) {
      return of(this.cache[cacheKey]);
    }

    const widgets: DashboardWidget[] = [
      {
        id: 'widget-1',
        type: 'stats',
        title: 'Farm Overview',
        data: null,
        position: { x: 0, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'widget-2',
        type: 'chart',
        title: 'Milk Production Trend',
        data: null,
        position: { x: 4, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'widget-3',
        type: 'list',
        title: 'Recent Health Alerts',
        data: null,
        position: { x: 8, y: 0 },
        size: { width: 4, height: 2 }
      }
    ];

    this.setCache(cacheKey, widgets);
    return of(widgets);
  }

  saveDashboardLayout(widgets: DashboardWidget[]): void {
    this.setCache('dashboard_widgets', widgets);
    this.saveToLocalStorage('dashboard_widgets', widgets);
  }

  private isCacheValid(key: string): boolean {
    if (!this.cache[key]) return false;
    if (!this.cacheExpiry[key]) return false;
    return Date.now() < this.cacheExpiry[key];
  }

  private setCache(key: string, data: any): void {
    this.cache[key] = data;
    this.cacheExpiry[key] = Date.now() + this.CACHE_DURATION;
    this.saveToLocalStorage('farm_cache', this.cache);
    this.saveToLocalStorage('farm_cache_expiry', this.cacheExpiry);
  }

  private invalidateCache(key: string): void {
    delete this.cache[key];
    delete this.cacheExpiry[key];
  }

  clearAllCache(): void {
    this.cache = {};
    this.cacheExpiry = {};
    localStorage.removeItem('farm_cache');
    localStorage.removeItem('farm_cache_expiry');
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatWeight(weight: number): string {
    return `${weight.toFixed(1)} kg`;
  }

  formatMilkProduction(liters: number): string {
    return `${liters.toFixed(2)} L`;
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  validateAnimal(animal: Partial<Animal>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!animal.name || animal.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!animal.type) {
      errors.push('Animal type is required');
    }

    if (animal.weight !== undefined && animal.weight < 0) {
      errors.push('Weight must be a positive number');
    }

    if (animal.milkProduction !== undefined && animal.milkProduction < 0) {
      errors.push('Milk production must be a positive number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private addDays(date: string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  private getLastDayOfMonth(year: number, month: number): string {
    const lastDay = new Date(year, month, 0);
    return lastDay.toISOString().split('T')[0];
  }

  private filterAnimalsByDate(animals: Animal[], startDate: string, endDate: string): Animal[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return animals.filter(animal => {
      const checkupDate = new Date(animal.lastCheckup);
      return checkupDate >= start && checkupDate <= end;
    });
  }

  private getMockAnimals(): Observable<Animal[]> {
    const mockAnimals: Animal[] = [
      {
        id: 1,
        name: 'Bessie',
        type: 'Dairy Cow',
        birthDate: '2020-03-15',
        weight: 650,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-15',
        milkProduction: 28.5,
        feedConsumption: 22,
        notes: 'Top producer in the herd'
      },
      {
        id: 2,
        name: 'Daisy',
        type: 'Dairy Cow',
        birthDate: '2019-06-20',
        weight: 680,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-14',
        milkProduction: 26.0,
        feedConsumption: 21,
        notes: ''
      },
      {
        id: 3,
        name: 'Rosie',
        type: 'Dairy Cow',
        birthDate: '2021-01-10',
        weight: 590,
        healthStatus: 'Under Observation',
        lastCheckup: '2024-01-16',
        milkProduction: 18.5,
        feedConsumption: 19,
        notes: 'Slight decrease in milk production'
      },
      {
        id: 4,
        name: 'Buttercup',
        type: 'Dairy Cow',
        birthDate: '2020-08-25',
        weight: 620,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-12',
        milkProduction: 24.0,
        feedConsumption: 20,
        notes: ''
      },
      {
        id: 5,
        name: 'Stella',
        type: 'Dairy Cow',
        birthDate: '2018-11-30',
        weight: 710,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-13',
        milkProduction: 22.5,
        feedConsumption: 23,
        notes: 'Senior cow, consistent producer'
      },
      {
        id: 6,
        name: 'Clover',
        type: 'Heifer',
        birthDate: '2022-05-18',
        weight: 420,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-15',
        milkProduction: 0,
        feedConsumption: 15,
        notes: 'Expected to start milking in 6 months'
      },
      {
        id: 7,
        name: 'Blue',
        type: 'Bull',
        birthDate: '2019-02-14',
        weight: 950,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-10',
        milkProduction: 0,
        feedConsumption: 30,
        notes: 'Breeding bull'
      },
      {
        id: 8,
        name: 'Penny',
        type: 'Dairy Cow',
        birthDate: '2021-07-22',
        weight: 580,
        healthStatus: 'Sick',
        lastCheckup: '2024-01-16',
        milkProduction: 12.0,
        feedConsumption: 16,
        notes: 'Recovering from mastitis, on treatment'
      },
      {
        id: 9,
        name: 'Marigold',
        type: 'Dairy Cow',
        birthDate: '2020-04-05',
        weight: 640,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-14',
        milkProduction: 25.5,
        feedConsumption: 21,
        notes: ''
      },
      {
        id: 10,
        name: 'Luna',
        type: 'Dairy Cow',
        birthDate: '2021-09-12',
        weight: 550,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-15',
        milkProduction: 20.0,
        feedConsumption: 18,
        notes: 'First lactation'
      }
    ];

    return of(mockAnimals).pipe(delay(300));
  }

  selectAnimal(animal: Animal | null): void {
    this.selectedAnimalSignal.set(animal);
  }

  getSelectedAnimal(): Animal | null {
    return this.selectedAnimalSignal();
  }

  setFilter(filter: string): void {
    this.filterSignal.set(filter);
  }

  getFilter(): string {
    return this.filterSignal();
  }

  getFilteredAnimals(): Observable<Animal[]> {
    const filter = this.filterSignal();
    return this.animals$.pipe(
      map(animals => {
        if (!filter) return animals;
        const lowerFilter = filter.toLowerCase();
        return animals.filter(a =>
          a.name.toLowerCase().includes(lowerFilter) ||
          a.type.toLowerCase().includes(lowerFilter) ||
          a.healthStatus.toLowerCase().includes(lowerFilter)
        );
      })
    );
  }
}
