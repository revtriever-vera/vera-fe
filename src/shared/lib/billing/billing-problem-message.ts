import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatDayMonth } from './billing-dates';

function capReachedMessage(t: TFunction<'billing'>, error: ApiError, locale: SupportedLocale): string {
    const resetsAt: unknown = error.problem.meta?.['resetsAt'];
    if (typeof resetsAt !== 'string') {
        return t('errors.capReachedNoDate');
    }
    return t('errors.capReached', { date: formatDayMonth(resetsAt, locale) });
}

export function billingProblemMessage(t: TFunction<'billing'>, error: Error, locale: SupportedLocale): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    switch (error.problem.type) {
        case 'billing.premium_required':
            return t('errors.premiumRequired');
        case 'billing.feature_disabled':
            return t('errors.featureDisabled');
        case 'usage.cap_reached':
            return capReachedMessage(t, error, locale);
        default:
            return t('errors.generic');
    }
}
