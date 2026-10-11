import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { ApiError } from '@/shared/lib/api/api-error';
import { exportErrorMessage } from './export-error-message';

function apiError(status: number, type: string): ApiError {
    return new ApiError({ type, title: type, status, detail: type, requestId: null });
}

describe('exportErrorMessage', () => {
    const t: TFunction<'portfolioAssets'> = i18n.getFixedT('pt-BR', 'portfolioAssets');
    const tp: TFunction<'portfolio'> = i18n.getFixedT('pt-BR', 'portfolio');

    it('429 vira a mensagem de limite', () => {
        expect(exportErrorMessage(t, tp, apiError(429, 'core.too_many_attempts'))).toContain('muitas planilhas');
    });

    it('erro de cliente usa a tradução do código', () => {
        expect(exportErrorMessage(t, tp, apiError(400, 'validation_failed'))).toBe(tp('errors.validationFailed'));
    });

    it('5xx e falha de rede viram a mensagem de falha', () => {
        expect(exportErrorMessage(t, tp, apiError(500, 'x'))).toBe(t('export.failed'));
        expect(exportErrorMessage(t, tp, new Error('rede'))).toBe(t('export.failed'));
    });
});
