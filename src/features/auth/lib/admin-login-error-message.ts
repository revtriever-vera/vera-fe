import type { TFunction } from 'i18next';
import type ptBRAdmin from '@/shared/lib/i18n/resources/pt-BR/admin.json';
import { ApiError } from '@/shared/lib/api/api-error';

type AdminDictionary = typeof ptBRAdmin;

type AdminKey = { [K in keyof AdminDictionary]: AdminDictionary[K] extends string ? K : never }[keyof AdminDictionary];

const ERROR_KEYS: Readonly<Record<string, AdminKey>> = {
    'identity.invalid_google_token': 'errorInvalidGoogleToken',
    'identity.platform_only': 'errorPlatformOnly',
    'identity.admin_audience_required': 'errorPlatformOnly',
    'identity.platform_disabled': 'errorPlatformDisabled',
    'identity.provider_disabled': 'errorProviderDisabled',
    'core.too_many_attempts': 'errorTooManyAttempts'
};

export function adminLoginErrorMessage(t: TFunction<'admin'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorGeneric');
    }
    return t(ERROR_KEYS[error.problem.type] ?? 'errorGeneric');
}
