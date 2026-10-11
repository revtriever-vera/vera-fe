import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { formatCurrency } from '@/shared/lib/format/currency';
import { i18n } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { gapSentence } from './gap-sentence';

function sentence(locale: SupportedLocale, status: 'within' | 'above' | 'below', gapMinor: number, currency: string): string {
    const t: TFunction<'portfolioOverview'> = i18n.getFixedT(locale, 'portfolioOverview');
    return gapSentence(t, status, gapMinor, (minor: number): string => formatCurrency(minor, currency, locale)).replaceAll('\u00a0', ' ');
}

describe('gapSentence', () => {
    it('na faixa não cita valor', () => {
        expect(sentence('pt-BR', 'within', 1234, 'BRL')).toBe('Na faixa de tolerância');
    });

    it('abaixo da meta diz quanto falta', () => {
        expect(sentence('pt-BR', 'below', 8377205, 'BRL')).toBe('Faltam R$ 83.772,05 para a meta');
    });

    it('acima da meta usa o valor absoluto da lacuna', () => {
        expect(sentence('pt-BR', 'above', -11893098, 'BRL')).toBe('R$ 118.930,98 acima da meta');
    });

    it('fala inglês com o dinheiro do locale', () => {
        expect(sentence('en', 'within', 0, 'BRL')).toBe('Within the tolerance range');
        expect(sentence('en', 'below', 8377205, 'USD')).toBe('$83,772.05 short of the target');
        expect(sentence('en', 'above', -11893098, 'USD')).toBe('$118,930.98 above the target');
    });
});
