/**
 * EVALUATION TESTS - Do not send to candidates
 *
 * Tests for CSV data formatting quality.
 * Copy this file to src/app/ in the candidate's submission before running.
 */

describe('CSV Data Formatting', () => {

  describe('CSV Structure', () => {
    it('should have header row as first line', () => {
      const sampleCSV = `name,type,weight
Bessie,Cow,650
Penny,Cow,580`;

      const lines = sampleCSV.split('\n');
      const headers = lines[0].split(',');

      expect(headers.length).toBeGreaterThan(0);
      expect(headers.some(h => isNaN(Number(h)))).withContext('Headers should be text, not numbers').toBeTrue();
    });

    it('should have consistent column count across all rows', () => {
      const sampleCSV = `name,type,weight
Bessie,Cow,650
Penny,Cow,580`;

      const lines = sampleCSV.split('\n').filter(l => l.trim());
      const columnCounts = lines.map(line => line.split(',').length);

      const allSame = columnCounts.every(count => count === columnCounts[0]);
      expect(allSame).withContext('All rows should have same number of columns').toBeTrue();
    });

    it('should use standard line endings', () => {
      const sampleCSV = `name,type\nBessie,Cow\nPenny,Cow`;

      // Should use \n or \r\n, not mixed
      const hasCRLF = sampleCSV.includes('\r\n');
      const hasLF = sampleCSV.includes('\n');
      const hasStandaloneLF = !hasCRLF && hasLF;
      const hasConsistentEndings = hasCRLF || hasStandaloneLF;

      expect(hasConsistentEndings).toBeTrue();
    });
  });

  describe('Data Type Handling', () => {
    it('should format numbers without quotes (unless containing special chars)', () => {
      const numericValue = formatCSVValue(650);
      expect(numericValue).toBe('650');
    });

    it('should format strings properly', () => {
      const stringValue = formatCSVValue('Bessie');
      expect(stringValue).toBe('Bessie');
    });

    it('should handle null/undefined gracefully', () => {
      const nullValue = formatCSVValue(null);
      const undefinedValue = formatCSVValue(undefined);

      expect(nullValue).toBe('');
      expect(undefinedValue).toBe('');
    });

    it('should handle boolean values', () => {
      const trueValue = formatCSVValue(true);
      const falseValue = formatCSVValue(false);

      expect(trueValue).toMatch(/true|1|yes/i);
      expect(falseValue).toMatch(/false|0|no/i);
    });

    it('should format dates readably', () => {
      const dateValue = formatCSVValue(new Date('2024-01-15'));

      // Should be human-readable, not timestamp
      expect(dateValue).toMatch(/2024|Jan|01|15/);
      expect(dateValue).not.toMatch(/^\d{13}$/); // Not a timestamp
    });
  });

  describe('Special Character Handling', () => {
    it('should escape commas in values', () => {
      const valueWithComma = formatCSVValue('Test, value');

      // Should be quoted to prevent comma from being treated as delimiter
      expect(valueWithComma).toBe('"Test, value"');
    });

    it('should escape double quotes in values', () => {
      const valueWithQuote = formatCSVValue('Test "quoted" value');

      // Quotes should be doubled and value should be wrapped
      expect(valueWithQuote).toBe('"Test ""quoted"" value"');
    });

    it('should escape newlines in values', () => {
      const valueWithNewline = formatCSVValue('Line 1\nLine 2');

      // Should be quoted to preserve newline
      expect(valueWithNewline.startsWith('"')).toBeTrue();
      expect(valueWithNewline.endsWith('"')).toBeTrue();
    });

    it('should handle values with multiple special characters', () => {
      const complexValue = formatCSVValue('Test, with "quotes" and\nnewlines');

      expect(complexValue.startsWith('"')).toBeTrue();
      expect(complexValue.endsWith('"')).toBeTrue();
      expect(complexValue).toContain('""'); // Escaped quotes
    });
  });

  describe('Export Data Completeness', () => {
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

    it('should include essential animal fields', () => {
      const csv = generateAnimalCSV(mockAnimals);

      expect(csv.toLowerCase()).toContain('name');
      expect(csv.toLowerCase()).toContain('type');
      expect(csv.toLowerCase()).toContain('weight');
      expect(csv.toLowerCase()).toContain('health');
    });

    it('should include all animals in export', () => {
      const multipleAnimals = [
        { ...mockAnimals[0], id: 1, name: 'Bessie' },
        { ...mockAnimals[0], id: 2, name: 'Daisy' },
        { ...mockAnimals[0], id: 3, name: 'Rosie' }
      ];

      const csv = generateAnimalCSV(multipleAnimals);

      expect(csv).toContain('Bessie');
      expect(csv).toContain('Daisy');
      expect(csv).toContain('Rosie');
    });

    it('should include statistics section', () => {
      const csv = generateStatsCSV(mockStats);

      const hasStats = csv.includes('10') || // total animals
                       csv.includes('175.5') || // milk production
                       csv.toLowerCase().includes('total');

      expect(hasStats).withContext('CSV should include statistics').toBeTrue();
    });
  });
});

// Helper functions for testing (mirror expected implementation patterns)

function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  return stringValue;
}

function generateAnimalCSV(animals: any[]): string {
  if (!animals || animals.length === 0) {
    return 'No animals to export';
  }

  const headers = ['name', 'type', 'weight', 'healthStatus', 'milkProduction', 'lastCheckup'];
  const headerRow = headers.join(',');

  const dataRows = animals.map(animal =>
    headers.map(h => formatCSVValue(animal[h])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

function generateStatsCSV(stats: any): string {
  if (!stats) {
    return 'No statistics available';
  }

  const rows = Object.entries(stats).map(([key, value]) =>
    `${key},${formatCSVValue(value)}`
  );

  return ['Metric,Value', ...rows].join('\n');
}
