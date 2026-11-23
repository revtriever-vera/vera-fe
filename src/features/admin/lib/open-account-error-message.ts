import type { TFunction } from 'i18next';
import type ptBRAdmin from '@/shared/lib/i18n/resources/pt-BR/admin.json';
import { ApiError } from '@/shared/lib/api/api-error';

type AdminDictionary = typeof ptBRAdmin;

type AdminKey = { [K in keyof AdminDictionary]: AdminDictionary[K] extends string ? K : never }[keyof AdminDictionary];

const ERROR_KEYS: Readonly<Record<string, AdminKey>> = {
    'identity.platform_only': 'errorPlatformOnly',
    'identity.platform_disabled': 'errorPlatformDisabled',
    'platform.account_not_found': 'errorAccountNotFound',
    validation_failed: 'errorOpenInvalid',
    'core.validation_failed': 'errorOpenInvalid'
};

export function openAccountErrorMessage(t: TFunction<'admin'>, error: Error): string {
    if (!(error instanceof ApiError)) {
        return t('errorActionGeneric');
    }
    return t(ERROR_KEYS[error.problem.type] ?? 'errorActionGeneric');
}
