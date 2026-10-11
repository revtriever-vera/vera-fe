import { describe, expect, it } from 'vitest';
import { headlineOf } from './summary-headline';

const income = (minor: number): { minor: number; mode: 'transactions'; fromTransactionsMinor: number } => ({
    minor,
    mode: 'transactions',
    fromTransactionsMinor: minor
});

describe('headlineOf', () => {
    it('com renda e saldo positivo é saved', () => {
        expect(headlineOf({ income: income(2800000), savedMinor: 336000 })).toBe('saved');
    });

    it('saldo zero ainda é saved', () => {
        expect(headlineOf({ income: income(2800000), savedMinor: 0 })).toBe('saved');
    });

    it('guardado negativo é overspent', () => {
        expect(headlineOf({ income: income(2800000), savedMinor: -1 })).toBe('overspent');
    });

    it('sem renda é no_income, mesmo com saldo negativo', () => {
        expect(headlineOf({ income: income(0), savedMinor: -500000 })).toBe('no_income');
    });
});
