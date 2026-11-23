import type { TFunction } from 'i18next';
import type ptBRAuth from '@/shared/lib/i18n/resources/pt-BR/auth.json';
import { ApiError } from '@/shared/lib/api/api-error';
import { authErrorMessage } from './auth-error-message';

type AuthDictionary = typeof ptBRAuth;

type AuthKey = { [K in keyof AuthDictionary]: AuthDictionary[K] extends string ? K : never }[keyof AuthDictionary];

const NOT_ELIGIBLE: string = 'signup_links.account_not_eligible';

const REASON_KEYS: Readonly<Record<string, AuthKey>> = {
    'signup_links.not_found': 'offerErrorNotFound',
    'signup_links.not_owner': 'offerErrorNotOwner',
    'signup_links.email_already_used': 'offerErrorEmailUsed',
    'signup_links.email_unverified': 'offerErrorEmailUnverified',
    'signup_links.too_many_from_ip': 'offerErrorTooMany',
    'core.too_many_attempts': 'offerErrorTooMany'
};

const ELIGIBILITY_KEYS: Readonly<Record<string, AuthKey>> = {
    already_paid: 'offerErrorAlreadyPaid',
    trial_used: 'offerErrorTrialUsed',
    already_redeemed: 'offerErrorAlreadyRedeemed'
};

export function offerFailureCode(error: Error): string {
    return error instanceof ApiError ? error.problem.type : 'unknown';
}

export function offerReasonMessage(t: TFunction<'auth'>, code: string, detail?: string): string {
    if (code === NOT_ELIGIBLE) {
        return t(ELIGIBILITY_KEYS[detail ?? ''] ?? 'offerErrorNotEligible');
    }
    const key: AuthKey | undefined = REASON_KEYS[code];
    return key === undefined ? t('errorGeneric') : t(key);
}

export function offerErrorMessage(t: TFunction<'auth'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorGeneric');
    }
    const detail: unknown = error.problem.meta?.['reason'];
    const known: boolean = error.problem.type === NOT_ELIGIBLE || error.problem.type in REASON_KEYS;
    if (!known) {
        return authErrorMessage(t, error);
    }
    return offerReasonMessage(t, error.problem.type, typeof detail === 'string' ? detail : undefined);
}
