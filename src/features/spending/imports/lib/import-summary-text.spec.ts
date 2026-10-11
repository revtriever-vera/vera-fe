import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import type { ImportRejection } from '../../types';
import { importView, ofxPreview } from '../../../../../test/fixtures/spending';
import { formatMoment, formatShortDay, historyCountsText, previewSummaryText, rejectionsText, resultCounts } from './import-summary-text';

const t: TFunction<'spendingImports'> = i18n.getFixedT('pt-BR', 'spendingImports');
const tEn: TFunction<'spendingImports'> = i18n.getFixedT('en', 'spendingImports');

describe('resultCounts', () => {
    it('plural de inseridas, ignoradas e rejeitadas', () => {
        expect(resultCounts(t, { inserted: 4, duplicates: 2, rejected: 3 })).toEqual({
            inserted: '4 novas transações',
            duplicates: '2 já estavam na Vera e foram ignoradas',
            rejected: '3 linhas rejeitadas'
        });
    });

    it('singular', () => {
        expect(resultCounts(t, { inserted: 1, duplicates: 1, rejected: 1 })).toEqual({
            inserted: '1 nova transação',
            duplicates: '1 já estava na Vera e foi ignorada',
            rejected: '1 linha rejeitada'
        });
    });

    it('zero', () => {
        expect(resultCounts(t, { inserted: 0, duplicates: 0, rejected: 0 })).toEqual({
            inserted: 'Nenhuma transação nova',
            duplicates: 'Nenhuma transação repetida',
            rejected: 'Nenhuma linha rejeitada'
        });
    });

    it('em inglês', () => {
        expect(resultCounts(tEn, { inserted: 1, duplicates: 2, rejected: 0 })).toEqual({
            inserted: '1 new transaction',
            duplicates: '2 were already in Vera and were ignored',
            rejected: 'No rejected lines'
        });
    });
});

describe('historyCountsText', () => {
    it('une novas e ignoradas', () => {
        expect(historyCountsText(t, { inserted: 4, duplicates: 2 })).toBe('4 novas · 2 ignoradas');
        expect(historyCountsText(t, { inserted: 1, duplicates: 1 })).toBe('1 nova · 1 ignorada');
    });
});

describe('previewSummaryText', () => {
    it('conta as transações e mostra o período', () => {
        expect(previewSummaryText(t, ofxPreview(), 'pt-BR')).toBe('6 transações · de 02/09 a 27/09');
        expect(previewSummaryText(t, ofxPreview({ rows: 1 }), 'pt-BR')).toBe('1 transação · de 02/09 a 27/09');
    });

    it('sem período', () => {
        expect(previewSummaryText(t, ofxPreview({ periodStart: null, periodEnd: null }), 'pt-BR')).toBe('6 transações · sem período');
    });

    it('formata a data conforme o idioma', () => {
        expect(formatShortDay('2026-09-27', 'en')).toBe('09/27');
        expect(formatMoment('2026-10-05T15:00:00.000Z', 'pt-BR')).toBe('05/10');
    });
});

describe('rejectionsText', () => {
    it('agrupa as linhas pelo motivo', () => {
        const text: string = rejectionsText(t, 'pt-BR', 4, [
            { line: 4, reason: 'invalid_date' },
            { line: 9, reason: 'invalid_date' },
            { line: 12, reason: 'invalid_date' },
            { line: 15, reason: 'zero_amount' }
        ]);

        expect(text).toBe('4 linhas não puderam ser lidas (linhas 4, 9 e 12: data inválida; linha 15: valor zerado)');
    });

    it('limita as linhas citadas por motivo', () => {
        const rejections: ImportRejection[] = [1, 2, 3, 4, 5, 6, 7].map((line: number) => ({ line, reason: 'empty_description' as const }));

        expect(rejectionsText(t, 'pt-BR', 7, rejections)).toBe('7 linhas não puderam ser lidas (linhas 1, 2, 3, 4 e 5: sem descrição)');
    });

    it('singular', () => {
        expect(rejectionsText(t, 'pt-BR', 1, [{ line: 2, reason: 'invalid_amount' }])).toBe(
            '1 linha não pôde ser lida (linha 2: valor inválido)'
        );
    });
});

describe('importView fixture', () => {
    it('serve de base para o histórico', () => {
        expect(importView().status).toBe('completed');
    });
});
