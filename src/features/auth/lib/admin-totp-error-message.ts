import type { TFunction } from 'i18next';
import type ptBRAdmin from '@/shared/lib/i18n/resources/pt-BR/admin.json';
import { ApiError } from '@/shared/lib/api/api-error';
import { adminLoginErrorMessage } from './admin-login-error-message';

type AdminDictionary = typeof ptBRAdmin;

type AdminKey = { [K in keyof AdminDictionary]: AdminDictionary[K] extends string ? K : never }[keyof AdminDictionary];

const TOTP_ERROR_KEYS: Readonly<Record<string, AdminKey>> = {
    'identity.invalid_totp_code': 'errorInvalidTotpCode',
    'identity.invalid_totp_token': 'errorTotpSessionExpired',
    'identity.totp_already_active': 'errorTotpAlreadyActive',
    'identity.totp_not_enrolled': 'errorTotpNotEnrolled',
    'core.too_many_attempts': 'errorTotpLocked'
};

const RESTART_TYPES: ReadonlySet<string> = new Set<string>([
    'identity.invalid_totp_token',
    'identity.totp_already_active',
    'identity.totp_not_enrolled'
]);

export function adminTotpErrorMessage(t: TFunction<'admin'>, error: Error): string {
    if (error instanceof ApiError && error.problem.type in TOTP_ERROR_KEYS) {
        return t(TOTP_ERROR_KEYS[error.problem.type] as AdminKey);
    }
    return adminLoginErrorMessage(t, error);
}

export function requiresNewGoogleLogin(error: Error): boolean {
    return error instanceof ApiError && RESTART_TYPES.has(error.problem.type);
}
