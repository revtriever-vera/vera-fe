import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { GOALS_ERROR_KEYS, goalsErrorMessage } from './goals-error-message';

const t: TFunction<'portfolioGoals'> = i18n.getFixedT('pt-BR', 'portfolioGoals');

function problem(type: string): ApiError {
    return new ApiError({ type, title: 'x', status: 409, detail: 'd', requestId: null });
}

describe('goalsErrorMessage', () => {
    it.each(Object.keys(GOALS_ERROR_KEYS))('traduz o código %s', (code: string): void => {
        const message: string = goalsErrorMessage(t, problem(code));
        expect(message).not.toBe(t('errors.generic'));
        expect(message.length).toBeGreaterThan(0);
    });

    it('cai no texto genérico para um código desconhecido e para falha de rede', () => {
        expect(goalsErrorMessage(t, problem('goals.outro'))).toBe(t('errors.generic'));
        expect(goalsErrorMessage(t, new Error('network'))).toBe(t('errors.generic'));
        expect(goalsErrorMessage(t, null)).toBe(t('errors.generic'));
    });
});
