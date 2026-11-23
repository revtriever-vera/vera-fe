import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { whatsappErrorMessage } from './whatsapp-error-message';

const t: TFunction<'whatsapp'> = i18n.getFixedT('pt-BR', 'whatsapp');
const tBilling: TFunction<'billing'> = i18n.getFixedT('pt-BR', 'billing');

function apiError(type: string, status: number, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: type, status, detail: 'x', requestId: null, ...(meta === undefined ? {} : { meta }) });
}

describe('whatsappErrorMessage', () => {
    it.each([
        ['whatsapp.already_linked', 409, 'Você já tem um número vinculado.'],
        ['whatsapp.consent_required', 422, 'Marque a caixa de concordância para gerar o código.'],
        ['whatsapp.provider_disabled', 503, 'A Vera no WhatsApp está indisponível agora.'],
        ['core.too_many_attempts', 429, 'Muitos códigos seguidos. Tente de novo em uma hora.'],
        ['outra.coisa', 429, 'Muitos códigos seguidos. Tente de novo em uma hora.'],
        ['billing.premium_required', 402, 'Esta função é do plano Premium.'],
        ['outra.coisa', 500, 'Não foi possível falar com o WhatsApp agora. Tente de novo.']
    ])('%s (%i)', (type, status, message) => {
        expect(whatsappErrorMessage(t, tBilling, apiError(type, status), 'pt-BR')).toBe(message);
    });

    it('cota esgotada usa a mensagem da cobrança com a data', () => {
        const error: ApiError = apiError('usage.cap_reached', 429, { resetsAt: '2026-12-01T03:00:00.000Z' });
        expect(whatsappErrorMessage(t, tBilling, error, 'pt-BR')).toBe('A cota do mês acabou. Volta em 1º de dezembro.');
    });

    it('erro que não é da API cai na mensagem genérica', () => {
        expect(whatsappErrorMessage(t, tBilling, new Error('rede'), 'pt-BR')).toBe(
            'Não foi possível falar com o WhatsApp agora. Tente de novo.'
        );
    });
});
