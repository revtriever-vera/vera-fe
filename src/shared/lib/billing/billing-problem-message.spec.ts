import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { ApiError } from '@/shared/lib/api/api-error';
import { billingProblemMessage } from './billing-problem-message';

const t: TFunction<'billing'> = i18n.getFixedT('pt-BR', 'billing');

function problem(type: string, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: type, status: 402, detail: 'detail', requestId: null, meta });
}

describe('billingProblemMessage', () => {
    it('explains a Premium-only feature', () => {
        expect(billingProblemMessage(t, problem('billing.premium_required'), 'pt-BR')).toBe('Esta função é do plano Premium.');
    });

    it('explains a feature that is turned off', () => {
        expect(billingProblemMessage(t, problem('billing.feature_disabled'), 'pt-BR')).toBe(
            'Esta função não está ligada nesta instalação.'
        );
    });

    it('says when the quota comes back', () => {
        const error: ApiError = problem('usage.cap_reached', { resetsAt: '2026-11-01T12:00:00.000Z' });
        expect(billingProblemMessage(t, error, 'pt-BR')).toBe('A cota do mês acabou. Volta em 1º de novembro.');
    });

    it('says the quota is over when the date is missing', () => {
        expect(billingProblemMessage(t, problem('usage.cap_reached'), 'pt-BR')).toBe('A cota do mês acabou. Volta na virada do mês.');
    });

    it('falls back for an unknown code and for a network failure', () => {
        const generic: string = 'Não foi possível consultar o seu plano. Tente de novo.';
        expect(billingProblemMessage(t, problem('other.code'), 'pt-BR')).toBe(generic);
        expect(billingProblemMessage(t, new Error('network'), 'pt-BR')).toBe(generic);
    });
});
