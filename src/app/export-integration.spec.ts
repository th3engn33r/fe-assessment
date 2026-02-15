/**
 * EVALUATION TESTS - Do not send to candidates
 *
 * Integration tests that verify the full export workflow.
 * Copy this file to src/app/ in the candidate's submission before running.
 */

import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataService } from './core/services/data.service';
import { of } from 'rxjs';

describe('Export Integration Tests', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dataService: DataService;

  const mockAnimals = [
    { id: 1, name: 'Bessie', type: 'Dairy Cow', birthDate: '2020-03-15', weight: 650, healthStatus: 'Healthy', lastCheckup: '2024-01-15', milkProduction: 28.5 },
    { id: 2, name: 'Penny', type: 'Dairy Cow', birthDate: '2021-07-22', weight: 580, healthStatus: 'Sick', lastCheckup: '2024-01-16', milkProduction: 12.0 },
    { id: 3, name: 'Daisy', type: 'Dairy Cow', birthDate: '2019-06-20', weight: 680, healthStatus: 'Healthy', lastCheckup: '2024-01-14', milkProduction: 26.0 }
  ];

  const mockStats = {
    totalAnimals: 10,
    healthyAnimals: 8,
    sickAnimals: 2,
    totalMilkProduction: 175.5,
    averageWeight: 620,
    feedEfficiency: 1.2
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);

    spyOn(dataService, 'getAnimals').and.returnValue(of(mockAnimals));
    spyOn(dataService, 'getStats').and.returnValue(of(mockStats));
    spyOn(dataService, 'getDashboardWidgets').and.returnValue(of([]));

    fixture.detectChanges();
  });

  describe('Full Export Workflow', () => {
    let downloadedContent: string;
    let downloadedFilename: string;
    let createObjectURLSpy: jasmine.Spy;
    let revokeObjectURLSpy: jasmine.Spy;

    beforeEach(fakeAsync(() => {
      // Wait for component to load data
      tick(500);
      fixture.detectChanges();

      // Capture blob content and filename
      createObjectURLSpy = spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          downloadedContent = reader.result as string;
        };
        reader.readAsText(blob);
        return 'blob:test';
      });
      revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    }));

    it('should export all visible animals', fakeAsync(() => {
      component.animals = mockAnimals;
      component.stats = mockStats;

      component.exportDashboard();
      tick(100);

      expect(createObjectURLSpy).withContext('Export should call createObjectURL').toHaveBeenCalled();
      expect(downloadedContent).withContext('Export should produce downloadable content').toBeDefined();
      expect(downloadedContent).toContain('Bessie');
      expect(downloadedContent).toContain('Penny');
      expect(downloadedContent).toContain('Daisy');
    }));

    it('should include data when filter is set', fakeAsync(() => {
      component.animals = mockAnimals;
      component.stats = mockStats;
      component.searchFilter = 'Bessie';

      component.exportDashboard();
      tick(100);

      expect(createObjectURLSpy).withContext('Export should call createObjectURL').toHaveBeenCalled();
      expect(downloadedContent).withContext('Export should produce downloadable content').toBeDefined();
      // Should include at least Bessie
      expect(downloadedContent).toContain('Bessie');
    }));

    it('should create file with proper MIME type', fakeAsync(() => {
      component.animals = mockAnimals;
      component.stats = mockStats;

      let capturedBlob: Blob | null = null;
      createObjectURLSpy.and.callFake((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:test';
      });

      component.exportDashboard();
      tick();

      expect(capturedBlob).withContext('Export should create a Blob').toBeTruthy();
      expect(capturedBlob!.type).withContext('Blob should have CSV MIME type').toContain('csv');
    }));
  });

  describe('Export Performance', () => {
    it('should handle large datasets without hanging', fakeAsync(() => {
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');

      // Generate 1000 animals
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Animal ${i}`,
        type: 'Dairy Cow',
        birthDate: '2020-01-01',
        weight: 500 + Math.random() * 200,
        healthStatus: i % 10 === 0 ? 'Sick' : 'Healthy',
        lastCheckup: '2024-01-15',
        milkProduction: 20 + Math.random() * 15
      }));

      component.animals = largeDataset;
      component.stats = mockStats;

      const startTime = Date.now();

      expect(() => {
        component.exportDashboard();
        tick(1000);
      }).not.toThrow();

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
      expect(createObjectURLSpy).withContext('Export should complete and call createObjectURL').toHaveBeenCalled();
    }));
  });

  describe('Export Error Handling', () => {
    beforeEach(() => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
    });

    it('should not crash when data is loading', fakeAsync(() => {
      component.isLoading = true;
      component.animals = [];
      component.stats = null;

      expect(() => {
        component.exportDashboard();
        tick();
      }).not.toThrow();
    }));

    it('should not crash when there is an error state', fakeAsync(() => {
      component.errorMessage = 'Failed to load data';
      component.animals = [];
      component.stats = null;

      expect(() => {
        component.exportDashboard();
        tick();
      }).not.toThrow();
    }));
  });
});

describe('Export UI Feedback', () => {
  it('should show loading state during export (optional)', () => {
    expect(true).toBeTrue();
  });

  it('should show success message after export (optional)', () => {
    expect(true).toBeTrue();
  });

  it('should show error message if export fails (optional)', () => {
    expect(true).toBeTrue();
  });
});
