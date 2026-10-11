import { describe, expect, it } from 'vitest';
import { annualizedBps, roundYears, yearsBetween } from './fixed-income-summary';

describe('fixed-income-summary', () => {
    it('conta os anos entre duas datas', () => {
        expect(yearsBetween('2025-01-01', '2027-01-01')).toBeCloseTo(2, 1);
        expect(yearsBetween('2027-01-01', '2025-01-01')).toBe(0);
        expect(yearsBetween('2025-01-01', '2026-01-01T12:00:00Z')).toBeCloseTo(1, 1);
    });

    it('anualiza o acumulado composto', () => {
        expect(annualizedBps(2100, 2)).toBe(1000);
    });

    it('não anualiza períodos curtos demais', () => {
        expect(annualizedBps(50, 0.02)).toBeNull();
    });

    it('arredonda os anos em uma casa', () => {
        expect(roundYears(1.449)).toBe(1.4);
        expect(roundYears(1.451)).toBe(1.5);
    });
});
