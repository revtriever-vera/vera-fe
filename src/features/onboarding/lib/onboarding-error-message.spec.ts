import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import ptBROnboarding from '@/shared/lib/i18n/resources/pt-BR/onboarding.json';
import enOnboarding from '@/shared/lib/i18n/resources/en/onboarding.json';
import { problem } from '../../../../test/fixtures/auth';
import { isAlreadyClosed, onboardingErrorMessage } from './onboarding-error-message';

const CODES: Readonly<Record<string, { key: keyof typeof ptBROnboarding; status: number }>> = {
    'onboarding.already_closed': { key: 'errorAlreadyClosed', status: 409 },
    'onboarding.sample_unavailable': { key: 'errorSampleUnavailable', status: 409 },
    'onboarding.sample_failed': { key: 'errorSampleFailed', status: 500 },
    'core.too_many_attempts': { key: 'errorTooManyAttempts', status: 429 }
};

describe('onboardingErrorMessage', () => {
    it.each(Object.entries(CODES))('traduz %s nos dois idiomas', (code: string, { key, status }): void => {
        const error: ApiError = new ApiError(problem(code, status));

        expect(onboardingErrorMessage(i18n.getFixedT('pt-BR', 'onboarding'), error)).toBe(ptBROnboarding[key]);
        expect(onboardingErrorMessage(i18n.getFixedT('en', 'onboarding'), error)).toBe(enOnboarding[key]);
    });

    it('cai no genérico para código desconhecido e para erro que não é da API', () => {
        const t: TFunction<'onboarding'> = i18n.getFixedT('pt-BR', 'onboarding');

        expect(onboardingErrorMessage(t, new ApiError(problem('x.y', 500)))).toBe(ptBROnboarding.errorGeneric);
        expect(onboardingErrorMessage(t, new Error('rede'))).toBe(ptBROnboarding.errorGeneric);
    });

    it('nunca expõe o detalhe técnico', () => {
        const t: TFunction<'onboarding'> = i18n.getFixedT('pt-BR', 'onboarding');

        expect(onboardingErrorMessage(t, new ApiError(problem('onboarding.sample_failed', 500)))).not.toContain('detalhe técnico');
    });

    it('reconhece o já encerrado', () => {
        expect(isAlreadyClosed(new ApiError(problem('onboarding.already_closed', 409)))).toBe(true);
        expect(isAlreadyClosed(new ApiError(problem('x', 409)))).toBe(false);
        expect(isAlreadyClosed(new Error('x'))).toBe(false);
    });
});
