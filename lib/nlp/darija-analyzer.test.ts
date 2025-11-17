/**
 * Tests for Darija NLP Analyzer
 */

import {
  analyzeDarijaText,
  extractKeywords,
  detectSentiment,
  parseNumbers,
  extractEntities,
} from './darija-analyzer';

describe('Darija Analyzer', () => {
  describe('analyzeDarijaText', () => {
    it('should analyze problem description in Darija', () => {
      const text = 'Gal3a rasi, kaykhdaw bzaf dyal wa9t bach y7alou l-mochkil dyal l-fellahin';
      const result = analyzeDarijaText(text);

      expect(result.language).toBe('darija');
      expect(result.sentiment).toBe('frustrated');
      expect(result.keywords.pain.length).toBeGreaterThan(0);
      expect(result.intent).toBe('problem_description');
    });

    it('should handle code-switching', () => {
      const text = 'Le problème c\'est que kaykhdaw bzaf dyal temps pour résoudre ça';
      const result = analyzeDarijaText(text);

      expect(result.language).toBe('mixed');
      expect(result.codeSwitching.length).toBeGreaterThan(0);
    });

    it('should detect willingness to pay', () => {
      const text = 'Khlass dfa3 50 dh kol shahar bach y7al had l-mochkil';
      const result = analyzeDarijaText(text);

      expect(result.keywords.willingness.length).toBeGreaterThan(0);
      expect(result.numbers.length).toBeGreaterThan(0);
      expect(result.entities.amounts.money.length).toBeGreaterThan(0);
    });
  });

  describe('parseNumbers', () => {
    it('should parse Darija number words', () => {
      const numbers = parseNumbers('juj tlata rb3a khamsa');
      expect(numbers.length).toBe(4);
      expect(numbers[0].value).toBe(2);
      expect(numbers[1].value).toBe(3);
    });

    it('should parse Arabic numerals', () => {
      const numbers = parseNumbers('١٢٣');
      expect(numbers.length).toBeGreaterThan(0);
      expect(numbers[0].value).toBe(123);
    });

    it('should parse mixed numbers', () => {
      const numbers = parseNumbers('3 miliون');
      expect(numbers.length).toBeGreaterThan(0);
      expect(numbers[0].value).toBe(3000000);
    });
  });

  describe('extractEntities', () => {
    it('should extract locations', () => {
      const entities = extractEntities('L-fellahin f Casablanca kaykhdaw bzaf');
      expect(entities.locations).toContain('casablanca');
    });

    it('should extract money amounts', () => {
      const entities = extractEntities('Khlass dfa3 50 dh kol shahar');
      expect(entities.amounts.money.length).toBeGreaterThan(0);
      expect(entities.amounts.money[0].value).toBe(50);
      expect(entities.amounts.money[0].currency).toBe('MAD');
    });
  });

  describe('detectSentiment', () => {
    it('should detect positive sentiment', () => {
      const result = detectSentiment('Mizyan bzaf, had l-idea zwina');
      expect(result.type).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect frustration', () => {
      const result = detectSentiment('Gal3a rasi, telbara bzaf');
      expect(result.type).toBe('frustrated');
      expect(result.score).toBeLessThan(0);
    });
  });
});

