import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { exportErrorMessage } from './export-error-message';

const t: TFunction<'spendingTransactions'> = i18n.getFixedT('pt-BR', 'spendingTransactions');

function apiError(type: string, status: number): ApiError {
    return new ApiError({ type, title: type, status, detail: type, requestId: null });
}

describe('exportErrorMessage', () => {
    it('explica o limite de linhas', () => {
        expect(exportErrorMessage(t, apiError('transactions.export_too_large', 422))).toBe(
            'Muitas transações para um arquivo só. Escolha um período menor.'
        );
    });

    it('avisa do excesso de downloads', () => {
        expect(exportErrorMessage(t, apiError('core.too_many_attempts', 429))).toContain('Muitos downloads');
    });

    it('o resto vira a mensagem genérica', () => {
        expect(exportErrorMessage(t, apiError('core.internal', 500))).toBe('Não foi possível baixar a planilha. Tente de novo.');
        expect(exportErrorMessage(t, new Error('boom'))).toBe('Não foi possível baixar a planilha. Tente de novo.');
    });
});
