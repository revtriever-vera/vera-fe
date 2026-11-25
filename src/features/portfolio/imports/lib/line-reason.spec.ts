import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { lineReasonText } from './line-reason';

const t: TFunction<'portfolioImports'> = i18n.getFixedT('pt-BR', 'portfolioImports');

describe('lineReasonText', () => {
    it('explica o custo assumido pelo preço do arquivo', () => {
        expect(lineReasonText(t, 'assumed_cost')).toBe('Custo médio assumido pelo preço que aparece no arquivo; ajuste se souber o seu.');
    });

    it.each(['amount_mismatch', 'total_mismatch', 'date_out_of_range', 'position_mismatch', 'net_mismatch', 'out_of_order'])(
        'tem texto próprio para %s',
        (reason: string) => {
            expect(lineReasonText(t, reason)).not.toBe(lineReasonText(t, 'qualquer_outro'));
        }
    );

    it('cai no texto genérico para um motivo desconhecido', () => {
        expect(lineReasonText(t, 'qualquer_outro')).toBe('Confira esta linha antes de importar.');
    });
});
