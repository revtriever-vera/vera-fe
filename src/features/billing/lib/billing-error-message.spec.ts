import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { billingErrorCode, billingErrorMessage } from './billing-error-message';

const t: TFunction<'billing'> = i18n.getFixedT('pt-BR', 'billing');

function apiError(type: string, status: number): ApiError {
    return new ApiError({ type, title: type, status, detail: 'x', requestId: null });
}

describe('billingErrorMessage', () => {
    it.each([
        ['billing.already_subscribed', 409, 'Esta conta já é Premium.'],
        ['billing.not_available', 409, 'Planos não existem nesta instalação.'],
        ['billing.not_resumable', 409, 'Esta assinatura não pode mais ser reativada. Assine de novo.'],
        ['billing.engine_rejected', 422, 'A Revtriever recusou a operação. Tente de novo ou use outra forma de pagamento.'],
        ['billing.provider_unavailable', 502, 'A página de pagamento está fora do ar. Tente de novo em alguns minutos.'],
        ['billing.invoice_not_found', 404, 'Essa fatura não está mais em aberto.'],
        ['core.too_many_attempts', 429, 'Muitas tentativas. Tente de novo em uma hora.'],
        ['qualquer.coisa', 429, 'Muitas tentativas. Tente de novo em uma hora.'],
        ['outra.coisa', 500, 'Não foi possível concluir. Tente de novo.']
    ])('%s (%i)', (type, status, message) => {
        expect(billingErrorMessage(t, apiError(type, status))).toBe(message);
    });

    it('erro que não é da API cai na mensagem genérica', () => {
        expect(billingErrorMessage(t, new Error('offline'))).toBe('Não foi possível concluir. Tente de novo.');
    });
});

describe('billingErrorCode', () => {
    it('devolve o tipo do problema ou unknown', () => {
        expect(billingErrorCode(apiError('billing.engine_rejected', 422))).toBe('billing.engine_rejected');
        expect(billingErrorCode(new Error('offline'))).toBe('unknown');
    });
});
