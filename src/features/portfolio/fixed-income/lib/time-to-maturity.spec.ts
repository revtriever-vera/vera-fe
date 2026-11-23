import { describe, expect, it } from 'vitest';
import { daysBucket, timeToMaturity } from './time-to-maturity';

describe('timeToMaturity', () => {
    it('hoje no dia do vencimento', () => {
        expect(timeToMaturity(0)).toEqual({ unit: 'today', amount: 0 });
    });

    it('conta em dias até 60', () => {
        expect(timeToMaturity(1)).toEqual({ unit: 'days', amount: 1 });
        expect(timeToMaturity(60)).toEqual({ unit: 'days', amount: 60 });
    });

    it('conta em meses de 61 a 729 dias', () => {
        expect(timeToMaturity(61)).toEqual({ unit: 'months', amount: 2 });
        expect(timeToMaturity(729)).toEqual({ unit: 'months', amount: 24 });
    });

    it('conta em anos a partir de 730 dias, com uma casa', () => {
        expect(timeToMaturity(730)).toEqual({ unit: 'years', amount: 2 });
        expect(timeToMaturity(1000)).toEqual({ unit: 'years', amount: 2.7 });
    });
});

describe('daysBucket', () => {
    it('separa os destaques de 60 e 90 dias', () => {
        expect(daysBucket(60)).toBe('up_to_60');
        expect(daysBucket(61)).toBe('up_to_90');
        expect(daysBucket(90)).toBe('up_to_90');
        expect(daysBucket(91)).toBe('over_90');
    });
});
