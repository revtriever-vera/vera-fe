import type { TFunction } from 'i18next';
import type ptBRAssistant from '@/shared/lib/i18n/resources/pt-BR/assistant.json';
import { ApiError } from '@/shared/lib/api/api-error';

type ErrorKey = keyof typeof ptBRAssistant.errors;

const TOO_MANY_REQUESTS: number = 429;

const ERROR_KEYS: Readonly<Record<string, ErrorKey>> = {
    'ai.provider_disabled': 'providerDisabled',
    'assistant.turn_not_found': 'notFound',
    'assistant.confirmation_stale': 'confirmationStale',
    'assistant.action_expired': 'actionExpired',
    'assistant.action_resolved': 'actionResolved',
    'assistant.action_not_found': 'actionNotFound',
    'assistant.action_choice_invalid': 'choiceInvalid',
    'members.forbidden_role': 'forbiddenRole',
    'file.too_large': 'fileTooLarge',
    'format.not_recognized': 'formatNotRecognized',
    'format.too_many_rows': 'tooManyRows',
    'file.unreadable': 'fileUnreadable',
    'file.too_many_pages': 'fileUnreadable',
    'model.unreadable': 'fileUnreadable',
    'model.unavailable': 'modelUnavailable',
    'import.nothing_to_import': 'nothingToImport',
    'assistant.text_required': 'textRequired',
    'preview.expired': 'previewExpired',
    'import.has_blocked_lines': 'importBlocked',
    'import.position_mode_required': 'importBlocked',
    'import.invalid_edit': 'importInvalid',
    'import.invalid_corrections': 'importInvalid',
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
