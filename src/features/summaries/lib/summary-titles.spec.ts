import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { summaryDescription, summaryMeta, summaryTitle, summaryWhen } from './summary-titles';

const t: TFunction<'summaries'> = i18n.getFixedT('pt-BR', 'summaries');

describe('summaryTitle e summaryDescription', () => {
    it('o resumo do mês leva o nome do mês', () => {
        expect(summaryTitle(t, 'month', '2026-09', 'pt-BR')).toBe('Resumo de setembro');
        expect(summaryDescription(t, 'month')).toBe('O que mudou no mês e por quê.');
    });

    it('cortes e carteira têm título fixo', () => {
        expect(summaryTitle(t, 'cuts', undefined, 'pt-BR')).toBe('Como chegar à meta de economia');
        expect(summaryTitle(t, 'portfolio', undefined, 'pt-BR')).toBe('Resumo da carteira');
        expect(summaryDescription(t, 'cuts')).toBe('A conta da sugestão acima, em texto.');
        expect(summaryDescription(t, 'portfolio')).toBe('O que está fora da meta e para onde vai o próximo aporte.');
    });
});

describe('summaryMeta', () => {
    it('diz de onde vem o texto, por tipo', () => {
        expect(summaryMeta(t, 'month', false, 'hoje às 08:12')).toBe('Escrito hoje às 08:12 a partir dos totais do mês.');
        expect(summaryMeta(t, 'cuts', false, 'hoje às 08:12')).toBe('Escrito hoje às 08:12 a partir dos totais do mês e da meta.');
        expect(summaryMeta(t, 'portfolio', false, 'hoje às 08:12')).toBe('Escrito hoje às 08:12 a partir dos totais da carteira.');
    });

    it('com os números mudados, avisa', () => {
        expect(summaryMeta(t, 'month', true, 'hoje às 08:12')).toBe('Escrito hoje às 08:12. Os números mudaram depois disso.');
    });
});

describe('summaryWhen', () => {
    const now: Date = new Date(2026, 9, 8, 15, 0);

    it('hoje vira "hoje às"', () => {
        expect(summaryWhen(t, new Date(2026, 9, 8, 8, 12).toISOString(), now, 'pt-BR')).toBe('hoje às 08:12');
    });

    it('outro dia vira "em dia/mês às"', () => {
        expect(summaryWhen(t, new Date(2026, 9, 7, 8, 12).toISOString(), now, 'pt-BR')).toBe('em 07/10 às 08:12');
    });
});
