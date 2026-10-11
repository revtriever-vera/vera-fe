import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { displayQuantity, isZeroQuantity, parseQuantityDraft } from './quantity-draft';

describe('quantity-draft', () => {
    const t: TFunction<'portfolioAssets'> = i18n.getFixedT('pt-BR', 'portfolioAssets');

    it('formata com o separador do locale', () => {
        expect(displayQuantity('3.2', 'pt-BR')).toBe('3,2');
        expect(displayQuantity('3.2', 'en')).toBe('3.2');
    });

    it('reconhece zero', () => {
        expect(isZeroQuantity('0')).toBe(true);
        expect(isZeroQuantity('0.00')).toBe(true);
        expect(isZeroQuantity('1')).toBe(false);
        expect(isZeroQuantity(null)).toBe(false);
    });

    it('aceita vírgula e respeita as casas do ativo', () => {
        expect(parseQuantityDraft(t, '3,2', 2)).toEqual({ ok: true, value: '3.2' });
        expect(parseQuantityDraft(t, '2500.5', 0)).toEqual({ ok: false, message: 'Este ativo só aceita quantidades inteiras.' });
        expect(parseQuantityDraft(t, '', 0).ok).toBe(false);
        expect(parseQuantityDraft(t, '0', 0)).toEqual({ ok: true, value: '0' });
    });
});
