import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { lineReasonText } from './line-reason';

const t: TFunction<'portfolioImports'> = i18n.getFixedT('pt-BR', 'portfolioImports');

describe('lineReasonText', () => {
    it('explica o custo assumido pelo preço do extrato', () => {
        expect(lineReasonText(t, 'assumed_cost')).toBe('Custo médio assumido pelo preço do extrato; ajuste se souber o seu.');
    });

    it('cai no texto genérico para um motivo desconhecido', () => {
        expect(lineReasonText(t, 'qualquer_outro')).toBe('Confira esta linha antes de importar.');
    });
});
