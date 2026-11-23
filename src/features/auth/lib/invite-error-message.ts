import type { TFunction } from 'i18next';
import type ptBRAuth from '@/shared/lib/i18n/resources/pt-BR/auth.json';
import type { AuthProviderName } from '@/shared/lib/analytics/events';
import { ApiError } from '@/shared/lib/api/api-error';
import { authErrorMessage } from './auth-error-message';

type AuthDictionary = typeof ptBRAuth;

type AuthKey = { [K in keyof AuthDictionary]: AuthDictionary[K] extends string ? K : never }[keyof AuthDictionary];

const INVITE_KEYS: Readonly<Record<string, AuthKey>> = {
    'invites.invalid': 'inviteErrorInvalid',
    'invites.email_mismatch': 'inviteErrorEmailMismatch',
    'members.account_not_empty': 'inviteErrorAccountNotEmpty'
};

export function inviteFailureCode(error: Error): string {
    return error instanceof ApiError ? error.problem.type : 'unknown';
}

export function inviteErrorMessage(
    t: TFunction<'auth'>,
    error: Error,
    emailMasked: string,
    provider: AuthProviderName | null = null
): string {
    if (provider === 'facebook' && inviteFailureCode(error) === 'invites.email_mismatch') {
        return t('inviteErrorFacebookEmail', { email: emailMasked });
    }
    const key: AuthKey | undefined = INVITE_KEYS[inviteFailureCode(error)];
    if (key === undefined) {
        return authErrorMessage(t, error);
    }
    return t(key, { email: emailMasked });
}
