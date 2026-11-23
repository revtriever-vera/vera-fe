import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { problem } from '../../../../test/fixtures/auth';
import { NOTICES_ERROR_KEYS, noticesErrorMessage } from './notices-error-message';

const t: TFunction<'notices'> = i18n.getFixedT('pt-BR', 'notices');

describe('noticesErrorMessage', () => {
    it('traduz cada código conhecido', () => {
        for (const [code, key] of Object.entries(NOTICES_ERROR_KEYS)) {
            expect(noticesErrorMessage(t, new ApiError(problem(code, 400)))).toBe(t(key));
        }
    });

    it('cai no texto genérico para código desconhecido e para falha de rede', () => {
        expect(noticesErrorMessage(t, new ApiError(problem('algo.novo', 500)))).toBe(t('errors.generic'));
        expect(noticesErrorMessage(t, new Error('rede'))).toBe(t('errors.generic'));
        expect(noticesErrorMessage(t, null)).toBe(t('errors.generic'));
    });
});
