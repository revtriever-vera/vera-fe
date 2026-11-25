import type { TFunction } from 'i18next';
import type ptBRAssistant from '@/shared/lib/i18n/resources/pt-BR/assistant.json';
import { ApiError } from '@/shared/lib/api/api-error';

type ErrorKey = keyof typeof ptBRAssistant.errors;

const TOO_MANY_REQUESTS: number = 429;

const ERROR_KEYS: Readonly<Record<string, ErrorKey>> = {
    'ai.provider_disabled': 'providerDisabled',
    'assistant.turn_not_found': 'notFound',
    'core.too_many_attempts': 'tooMany'
};

export function assistantErrorMessage(t: TFunction<'assistant'>, error: Error, resetDate: string | null): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    if (error.problem.type === 'usage.cap_reached') {
        return resetDate === null ? t('errors.capReachedNoDate') : t('errors.capReached', { date: resetDate });
    }
    const key: ErrorKey | undefined = ERROR_KEYS[error.problem.type] ?? (error.status === TOO_MANY_REQUESTS ? 'tooMany' : undefined);
    return t(key === undefined ? 'errors.generic' : `errors.${key}`);
}

export function capResetsAt(error: Error | null): string | null {
    if (!(error instanceof ApiError) || error.problem.type !== 'usage.cap_reached') {
        return null;
    }
    const value: unknown = error.problem.meta?.['resetsAt'];
    return typeof value === 'string' ? value : null;
}
