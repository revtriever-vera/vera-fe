import type { ParseKeys, TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { billingProblemMessage } from '@/shared/lib/billing/billing-problem-message';
import type { SupportedLocale } from '@/shared/lib/locale';

type WhatsAppKey = ParseKeys<'whatsapp'>;

const TOO_MANY_REQUESTS: number = 429;

const CODE_KEYS: Readonly<Record<string, WhatsAppKey>> = {
    'whatsapp.already_linked': 'errors.alreadyLinked',
    'whatsapp.consent_required': 'errors.consentRequired',
    'whatsapp.provider_disabled': 'errors.providerDisabled',
    'core.too_many_attempts': 'errors.tooManyAttempts'
};

const BILLING_CODES: ReadonlySet<string> = new Set(['usage.cap_reached', 'billing.premium_required']);

export function whatsappErrorMessage(
    t: TFunction<'whatsapp'>,
    tBilling: TFunction<'billing'>,
    error: Error,
    locale: SupportedLocale
): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    if (BILLING_CODES.has(error.problem.type)) {
        return billingProblemMessage(tBilling, error, locale);
    }
    const code: string = error.status === TOO_MANY_REQUESTS ? 'core.too_many_attempts' : error.problem.type;
    return t(CODE_KEYS[code] ?? 'errors.generic');
}
