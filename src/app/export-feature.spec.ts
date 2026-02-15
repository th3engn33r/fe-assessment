/**
 * EVALUATION TESTS - Do not send to candidates
 *
 * These tests verify the export feature implementation.
 * Copy this file to src/app/ in the candidate's submission before running.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataService } from './core/services/data.service';
import { of } from 'rxjs';

describe('Export Feature - Dashboard', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dataService: DataService;

  const mockAnimals = [
    {
      id: 1,
      name: 'Bessie',
      type: 'Dairy Cow',
      birthDate: '2020-03-15',
      weight: 650,
      healthStatus: 'Healthy',
      lastCheckup: '2024-01-15',
      milkProduction: 28.5,
      feedConsumption: 22
    },
    {
      id: 2,
      name: 'Penny',
      type: 'Dairy Cow',
      birthDate: '2021-07-22',
      weight: 580,
      healthStatus: 'Sick',
      lastCheckup: '2024-01-16',
      milkProduction: 12.0,
      feedConsumption: 16
    }
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
      ],
      providers: [DataService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);

    // Mock data service methods
    spyOn(dataService, 'getAnimals').and.returnValue(of(mockAnimals));
    spyOn(dataService, 'getStats').and.returnValue(of(mockStats));
    spyOn(dataService, 'getDashboardWidgets').and.returnValue(of([]));

    fixture.detectChanges();
  });

  describe('Export Button', () => {
    it('should have an export button on the dashboard', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const exportBtn = Array.from(buttons).find((btn: any) =>
        btn.textContent.toLowerCase().includes('export')
      );

      expect(exportBtn).withContext('Export button should exist on dashboard').toBeTruthy();
    });

    it('should call exportDashboard when export button is clicked', () => {
      spyOn(component, 'exportDashboard');

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const exportBtn: HTMLButtonElement = Array.from(buttons).find((btn: any) =>
        btn.textContent.toLowerCase().includes('export')
      ) as HTMLButtonElement;

      expect(exportBtn).withContext('Export button must exist').toBeTruthy();
      exportBtn.click();
      expect(component.exportDashboard).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('should have exportDashboard method implemented (not just console.log)', () => {
      expect(component.exportDashboard).toBeDefined();

      // Check it's not the stub implementation
      const methodSource = component.exportDashboard.toString();
      const isStub = methodSource.includes('not yet implemented') ||
                     (methodSource.includes('console.log') && !methodSource.includes('Blob'));

      expect(isStub).withContext('exportDashboard should be implemented, not a stub').toBeFalse();
    });

    it('should trigger a file download when exportDashboard is called', fakeAsync(() => {
      // Setup component data
      component.animals = mockAnimals;
      component.stats = mockStats;

      // Spy on URL.createObjectURL to verify Blob creation
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

      component.exportDashboard();
      tick();

      // Should have created a blob URL
      expect(createObjectURLSpy).toHaveBeenCalled();

      // Should have cleaned up the URL
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    }));

    it('should create CSV content with Blob', fakeAsync(() => {
      component.animals = mockAnimals;
      component.stats = mockStats;

      let capturedBlob: Blob | null = null;
      spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:test';
      });
      spyOn(URL, 'revokeObjectURL');

      component.exportDashboard();
      tick();

      expect(capturedBlob).withContext('Export should create a Blob').toBeTruthy();
      expect(capturedBlob!.type).withContext('Blob should have CSV MIME type').toContain('csv');
    }));
  });

  describe('Export Content', () => {
    let exportedContent: string;

    beforeEach(fakeAsync(() => {
      component.animals = mockAnimals;
      component.stats = mockStats;

      // Capture blob content
      spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
        // Read blob content asynchronously
        const reader = new FileReader();
        reader.onload = () => {
          exportedContent = reader.result as string;
        };
        reader.readAsText(blob);
        return 'blob:test';
      });
      spyOn(URL, 'revokeObjectURL');

      component.exportDashboard();
      tick(100); // Give time for FileReader
    }));

    it('should export data in CSV format', fakeAsync(() => {
      tick(100);
      expect(exportedContent).withContext('Export should produce content').toBeDefined();
      expect(exportedContent).withContext('Export content should not be empty').toBeTruthy();
      const hasCSVStructure = exportedContent.includes(',') || exportedContent.includes('\n');
      expect(hasCSVStructure).withContext('Content should be CSV formatted').toBeTrue();
    }));

    it('should include animal names in export', fakeAsync(() => {
      tick(100);
      expect(exportedContent).withContext('Export should produce content').toBeDefined();
      expect(exportedContent.toLowerCase()).toContain('bessie');
      expect(exportedContent.toLowerCase()).toContain('penny');
    }));

    it('should include animal data fields in export', fakeAsync(() => {
      tick(100);
      expect(exportedContent).withContext('Export should produce content').toBeDefined();
      const content = exportedContent.toLowerCase();
      const hasWeight = content.includes('650') || content.includes('580');
      const hasMilk = content.includes('28.5') || content.includes('12');
      const hasType = content.includes('dairy') || content.includes('cow');

      expect(hasWeight || hasMilk || hasType)
        .withContext('Export should include animal data')
        .toBeTrue();
    }));

    it('should include statistics in export', fakeAsync(() => {
      tick(100);
      expect(exportedContent).withContext('Export should produce content').toBeDefined();
      const content = exportedContent.toLowerCase();
      const hasTotalAnimals = content.includes('10') || content.includes('total');
      const hasHealthy = content.includes('8') || content.includes('healthy');

      expect(hasTotalAnimals || hasHealthy)
        .withContext('Export should include statistics')
        .toBeTrue();
    }));

    it('should include health alerts for sick animals', fakeAsync(() => {
      tick(100);
      expect(exportedContent).withContext('Export should produce content').toBeDefined();
      const content = exportedContent.toLowerCase();
      const hasSickAnimal = content.includes('penny') || content.includes('sick');

      expect(hasSickAnimal)
        .withContext('Export should include health alerts')
        .toBeTrue();
    }));
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
    });

    it('should handle empty animal list gracefully', fakeAsync(() => {
      component.animals = [];
      component.stats = mockStats;

      expect(() => {
        component.exportDashboard();
        tick();
      }).not.toThrow();
    }));

    it('should handle missing stats gracefully', fakeAsync(() => {
      component.animals = mockAnimals;
      component.stats = null;

      expect(() => {
        component.exportDashboard();
        tick();
      }).not.toThrow();
    }));

    it('should handle animals with missing optional fields', fakeAsync(() => {
      component.animals = [{
        id: 1,
        name: 'Test',
        type: 'Cow',
        birthDate: '2020-01-01',
        weight: 500,
        healthStatus: 'Healthy',
        lastCheckup: '2024-01-01'
        // milkProduction and feedConsumption are missing
      }];
      component.stats = mockStats;

      expect(() => {
        component.exportDashboard();
        tick();
      }).not.toThrow();
    }));
  });
});
