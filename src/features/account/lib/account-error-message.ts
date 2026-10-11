import type { TFunction } from 'i18next';
import type ptBRAccount from '@/shared/lib/i18n/resources/pt-BR/account.json';
import { ApiError } from '@/shared/lib/api/api-error';

type AccountDictionary = typeof ptBRAccount;

type AccountKey = { [K in keyof AccountDictionary]: AccountDictionary[K] extends string ? K : never }[keyof AccountDictionary];

const TOO_MANY_REQUESTS: number = 429;

export type AccountErrorScope = 'export' | 'delete' | 'language';

const ERROR_KEYS: Readonly<Record<string, AccountKey>> = {
    'identity.confirmation_mismatch': 'errorConfirmationMismatch',
    'identity.forbidden': 'errorForbidden',
    'identity.export_failed': 'errorExportFailed',
    'identity.erasure_failed': 'errorErasureFailed',
    'core.too_many_attempts': 'errorTooManyAttempts'
};

const SCOPED_KEYS: Readonly<Record<AccountErrorScope, Readonly<Record<string, AccountKey>>>> = {
    export: { 'core.too_many_attempts': 'errorExportRateLimited' },
    delete: {},
    language: {}
};

const FALLBACK_KEYS: Readonly<Record<AccountErrorScope, AccountKey>> = {
    export: 'errorExportGeneric',
    delete: 'errorDeleteGeneric',
    language: 'errorLanguageGeneric'
};

export function accountErrorMessage(t: TFunction<'account'>, error: Error, scope: AccountErrorScope): string {
    if (!(error instanceof ApiError)) {
        return t(FALLBACK_KEYS[scope]);
    }
    const code: string = error.status === TOO_MANY_REQUESTS ? 'core.too_many_attempts' : error.problem.type;
    const key: AccountKey | undefined = SCOPED_KEYS[scope][code] ?? ERROR_KEYS[code];
    return t(key ?? FALLBACK_KEYS[scope]);
}
