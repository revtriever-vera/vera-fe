import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { problem } from '../../../../../test/fixtures/auth';
import { RECURRING_ERROR_KEYS, recurringErrorMessage } from './recurring-error-message';

const t: TFunction<'spendingRecurring'> = i18n.getFixedT('pt-BR', 'spendingRecurring');

describe('recurringErrorMessage', () => {
    it.each(Object.keys(RECURRING_ERROR_KEYS))('traduz o código %s', (code: string) => {
        const message: string = recurringErrorMessage(t, new ApiError(problem(code, 409)));

        expect(message).not.toBe(t('errors.generic'));
    });

    it('cai no texto genérico para código desconhecido e para erro de rede', () => {
        expect(recurringErrorMessage(t, new ApiError(problem('recurring.outro', 500)))).toBe(t('errors.generic'));
        expect(recurringErrorMessage(t, new Error('network'))).toBe(t('errors.generic'));
        expect(recurringErrorMessage(t, null)).toBe(t('errors.generic'));
    });
});
