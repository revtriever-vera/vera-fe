import type { TFunction } from 'i18next';
import type ptBRSummaries from '@/shared/lib/i18n/resources/pt-BR/summaries.json';
import { ApiError } from '@/shared/lib/api/api-error';

type ErrorKey = keyof typeof ptBRSummaries.errors;

const TOO_MANY_REQUESTS: number = 429;

const ERROR_KEYS: Readonly<Record<string, ErrorKey>> = {
    'ai.consent_required': 'consentRequired',
    'billing.premium_required': 'premiumRequired',
    'billing.feature_disabled': 'notConfigured',
    'ai.provider_unavailable': 'unavailable',
    'ai.invalid_response': 'unavailable',
    'ai.notice_outdated': 'noticeOutdated',
    'ai.repeated_request': 'repeated',
    'core.too_many_attempts': 'tooMany'
};

export function summaryErrorMessage(t: TFunction<'summaries'>, error: Error, resetDate: string | null): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    if (error.problem.type === 'usage.cap_reached') {
        return resetDate === null ? t('errors.capReachedNoDate') : t('errors.capReached', { date: resetDate });
    }
    const key: ErrorKey | undefined = ERROR_KEYS[error.problem.type] ?? (error.status === TOO_MANY_REQUESTS ? 'tooMany' : undefined);
    return t(key === undefined ? 'errors.generic' : `errors.${key}`);
}
