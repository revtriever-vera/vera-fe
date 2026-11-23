import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

export type NoticesErrorKey = 'errors.generic' | 'errors.invalidToken' | 'errors.rateLimited' | 'errors.unknownType';

export const NOTICES_ERROR_KEYS: Readonly<Record<string, NoticesErrorKey>> = {
    'notices.invalid_token': 'errors.invalidToken',
    'core.too_many_attempts': 'errors.rateLimited',
    'notices.unknown_type': 'errors.unknownType'
};

export function noticesErrorMessage(t: TFunction<'notices'>, error: Error | null): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    return t(NOTICES_ERROR_KEYS[error.problem.type] ?? 'errors.generic');
}
