import type { TFunction } from 'i18next';
import type ptBRAuth from '@/shared/lib/i18n/resources/pt-BR/auth.json';
import { ApiError } from '@/shared/lib/api/api-error';

type AuthDictionary = typeof ptBRAuth;

type AuthKey = { [K in keyof AuthDictionary]: AuthDictionary[K] extends string ? K : never }[keyof AuthDictionary];

const ERROR_KEYS: Readonly<Record<string, AuthKey>> = {
    'identity.invalid_google_token': 'errorInvalidGoogleToken',
    'identity.invalid_facebook_token': 'errorInvalidFacebookToken',
    'identity.provider_disabled': 'errorProviderDisabled',
    'identity.provider_unavailable': 'errorProviderUnavailable',
    'identity.email_not_provided': 'errorEmailNotProvided',
    'identity.email_in_use': 'errorEmailInUse',
    'core.too_many_attempts': 'errorTooManyAttempts'
};

export function authErrorMessage(t: TFunction<'auth'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorGeneric');
    }
    const key: AuthKey | undefined = ERROR_KEYS[error.problem.type];
    if (key === undefined) {
        return t('errorGeneric');
    }
    return t(key);
}
