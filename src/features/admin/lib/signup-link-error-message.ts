import type { TFunction } from 'i18next';
import type ptBRAdmin from '@/shared/lib/i18n/resources/pt-BR/admin.json';
import { ApiError } from '@/shared/lib/api/api-error';

type AdminDictionary = typeof ptBRAdmin;

type AdminKey = { [K in keyof AdminDictionary]: AdminDictionary[K] extends string ? K : never }[keyof AdminDictionary];

const ERROR_KEYS: Readonly<Record<string, AdminKey>> = {
    'identity.platform_only': 'errorPlatformOnly',
    'identity.platform_disabled': 'errorPlatformDisabled',
    'signup_links.not_found': 'errorLinkNotFound',
    'core.too_many_attempts': 'errorTooManyAttempts'
};

const OFFER_REASON_KEYS: Readonly<Record<string, AdminKey>> = {
    trial_days_without_trial: 'errorOffer_trial_days_without_trial',
    trial_days_out_of_range: 'errorOffer_trial_days_out_of_range',
    offer_validity_out_of_range: 'errorOffer_offer_validity_out_of_range',
    too_many_rules: 'errorOffer_too_many_rules',
    rule_out_of_range: 'errorOffer_rule_out_of_range',
    expires_in_the_past: 'errorOffer_expires_in_the_past',
    no_card_requires_max_uses: 'errorOffer_no_card_requires_max_uses',
    no_card_requires_expiry: 'errorOffer_no_card_requires_expiry',
    no_card_expiry_too_far: 'errorOffer_no_card_expiry_too_far'
};

function offerMessage(t: TFunction<'admin'>, error: ApiError): string {
    const reason: unknown = error.problem.meta?.['reason'];
    return t((typeof reason === 'string' ? OFFER_REASON_KEYS[reason] : undefined) ?? 'errorOffer_generic');
}

export function signupLinkErrorMessage(t: TFunction<'admin'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorActionGeneric');
    }
    if (error.problem.type === 'signup_links.invalid_offer') {
        return offerMessage(t, error);
    }
    return t(ERROR_KEYS[error.problem.type] ?? 'errorActionGeneric');
}
