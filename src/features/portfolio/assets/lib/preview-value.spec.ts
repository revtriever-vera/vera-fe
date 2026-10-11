import { describe, expect, it } from 'vitest';
import { needsExchangeRate, previewValueMinor, type PreviewValueArgs } from './preview-value';

describe('previewValueMinor', () => {
    it('multiplica quantidade por preço na mesma moeda', () => {
        expect(previewValueMinor({ quantity: '100', price: '37.80', priceCurrency: 'BRL', baseCurrency: 'BRL', brlPerUsd: null })).toBe(
            378000
        );
    });

    it('converte dólar para real pelo câmbio', () => {
        expect(previewValueMinor({ quantity: '40', price: '545', priceCurrency: 'USD', baseCurrency: 'BRL', brlPerUsd: '5.42' })).toBe(
            11815600
        );
    });

    it('divide pelo câmbio quando a base é dólar', () => {
        expect(previewValueMinor({ quantity: '100', price: '37.80', priceCurrency: 'BRL', baseCurrency: 'USD', brlPerUsd: '5' })).toBe(
            75600
        );
    });

    it('devolve nulo sem câmbio quando as moedas diferem', () => {
        expect(previewValueMinor({ quantity: '1', price: '10', priceCurrency: 'USD', baseCurrency: 'BRL', brlPerUsd: null })).toBeNull();
        expect(previewValueMinor({ quantity: '1', price: '10', priceCurrency: 'USD', baseCurrency: 'BRL', brlPerUsd: '0' })).toBeNull();
    });

    it('devolve nulo para quantidade vazia, inválida ou negativa', () => {
        const base: Omit<PreviewValueArgs, 'quantity'> = { price: '10', priceCurrency: 'BRL', baseCurrency: 'BRL', brlPerUsd: null };

        expect(previewValueMinor({ ...base, quantity: '' })).toBeNull();
        expect(previewValueMinor({ ...base, quantity: 'abc' })).toBeNull();
        expect(previewValueMinor({ ...base, quantity: '-1' })).toBeNull();
    });

    it('sabe quando precisa de câmbio', () => {
        expect(needsExchangeRate('USD', 'BRL')).toBe(true);
        expect(needsExchangeRate('BRL', 'BRL')).toBe(false);
    });
});
