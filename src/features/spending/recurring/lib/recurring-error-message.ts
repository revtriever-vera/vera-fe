import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

export type RecurringErrorKey =
    | 'errors.generic'
    | 'errors.forbidden'
    | 'errors.notFound'
    | 'errors.invalidState'
    | 'errors.categoryKindMismatch'
    | 'errors.validationFailed';

export const RECURRING_ERROR_KEYS: Readonly<Record<string, RecurringErrorKey>> = {
    validation_failed: 'errors.validationFailed',
    'identity.forbidden': 'errors.forbidden',
    'recurring.series_not_found': 'errors.notFound',
    'recurring.invalid_state': 'errors.invalidState',
    'recurring.category_kind_mismatch': 'errors.categoryKindMismatch'
};

export function recurringErrorMessage(t: TFunction<'spendingRecurring'>, error: Error | null): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    return t(RECURRING_ERROR_KEYS[error.problem.type] ?? 'errors.generic');
}
