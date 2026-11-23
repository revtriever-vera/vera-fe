import type { ParseKeys, TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

type BillingKey = ParseKeys<'billing'>;

const TOO_MANY_REQUESTS: number = 429;

const CODE_KEYS: Readonly<Record<string, BillingKey>> = {
    'billing.already_subscribed': 'errors.alreadySubscribed',
    'billing.not_available': 'errors.notAvailable',
    'billing.not_resumable': 'errors.notResumable',
    'billing.engine_rejected': 'errors.engineRejected',
    'billing.provider_unavailable': 'errors.providerUnavailable',
    'billing.invoice_not_found': 'errors.invoiceNotFound',
    'core.too_many_attempts': 'errors.tooManyAttempts'
};

export function billingErrorCode(error: Error): string {
    return error instanceof ApiError ? error.problem.type : 'unknown';
}

export function billingErrorMessage(t: TFunction<'billing'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errors.action');
    }
    const code: string = error.status === TOO_MANY_REQUESTS ? 'core.too_many_attempts' : error.problem.type;
    return t(CODE_KEYS[code] ?? 'errors.action');
}
