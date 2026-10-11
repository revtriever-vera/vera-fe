import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

export type SpendingErrorKey =
    | 'errors.generic'
    | 'errors.validationFailed'
    | 'errors.categoryNotFound'
    | 'errors.invalidRule'
    | 'errors.categoryLimitReached'
    | 'errors.categoryNameTaken'
    | 'errors.categoryNameRequired'
    | 'errors.flexibilityNotApplicable'
    | 'errors.ruleConflict'
    | 'errors.ruleNotFound'
    | 'errors.systemCategoryLocked'
    | 'errors.connectionNotFound'
    | 'errors.credentialsMissing'
    | 'errors.invalidCredentials'
    | 'errors.itemNotFound'
    | 'errors.itemNotFoundOnSync'
    | 'errors.providerUnavailable'
    | 'errors.providerDisabled'
    | 'errors.syncInProgress'
    | 'errors.syncUnavailable'
    | 'errors.secretOpenFailed'
    | 'errors.secretSealerMismatch'
    | 'errors.tooManyAttempts'
    | 'errors.currencyMismatch'
    | 'errors.fileTooLarge'
    | 'errors.importNotFound'
    | 'errors.invalidFile'
    | 'errors.mappingRequired'
    | 'errors.tooManyRows'
    | 'errors.unsupportedFormat'
    | 'errors.declaredIncomeRequired'
    | 'errors.invalidMonth'
    | 'errors.accountManagedByConnection'
    | 'errors.accountNotFound'
    | 'errors.categoryKindMismatch'
    | 'errors.exportTooLarge'
    | 'errors.transactionsLimitReached'
    | 'errors.transactionNotFound';

export const SPENDING_ERROR_KEYS: Readonly<Record<string, SpendingErrorKey>> = {
    validation_failed: 'errors.validationFailed',
    'categories.category_not_found': 'errors.categoryNotFound',
    'categories.invalid_rule': 'errors.invalidRule',
    'categories.limit_reached': 'errors.categoryLimitReached',
    'categories.name_taken': 'errors.categoryNameTaken',
    'categories.name_required': 'errors.categoryNameRequired',
    'categories.flexibility_not_applicable': 'errors.flexibilityNotApplicable',
    'categories.rule_conflict': 'errors.ruleConflict',
    'categories.rule_not_found': 'errors.ruleNotFound',
    'categories.system_category_locked': 'errors.systemCategoryLocked',
    'connections.connection_not_found': 'errors.connectionNotFound',
    'connections.credentials_missing': 'errors.credentialsMissing',
    'connections.invalid_credentials': 'errors.invalidCredentials',
    'connections.item_not_found': 'errors.itemNotFound',
    'connections.provider_unavailable': 'errors.providerUnavailable',
    'connections.provider_disabled': 'errors.providerDisabled',
    'connections.sync_in_progress': 'errors.syncInProgress',
    'connections.sync_unavailable': 'errors.syncUnavailable',
    'core.secret_open_failed': 'errors.secretOpenFailed',
    'core.secret_sealer_mismatch': 'errors.secretSealerMismatch',
    'core.too_many_attempts': 'errors.tooManyAttempts',
    'imports.currency_mismatch': 'errors.currencyMismatch',
    'imports.file_too_large': 'errors.fileTooLarge',
    'imports.import_not_found': 'errors.importNotFound',
    'imports.invalid_file': 'errors.invalidFile',
    'imports.mapping_required': 'errors.mappingRequired',
    'imports.too_many_rows': 'errors.tooManyRows',
    'imports.unsupported_format': 'errors.unsupportedFormat',
    'summary.declared_income_required': 'errors.declaredIncomeRequired',
    'summary.invalid_month': 'errors.invalidMonth',
    'transactions.account_managed_by_connection': 'errors.accountManagedByConnection',
    'transactions.account_not_found': 'errors.accountNotFound',
    'transactions.category_kind_mismatch': 'errors.categoryKindMismatch',
    'transactions.export_too_large': 'errors.exportTooLarge',
    'transactions.limit_reached': 'errors.transactionsLimitReached',
    'transactions.transaction_not_found': 'errors.transactionNotFound'
};

export type SpendingErrorContext = 'connect' | 'sync';

export const SPENDING_SYNC_ERROR_KEYS: Readonly<Record<string, SpendingErrorKey>> = {
    'connections.item_not_found': 'errors.itemNotFoundOnSync'
};

export function spendingErrorMessage(t: TFunction<'spending'>, error: Error | null, context: SpendingErrorContext = 'connect'): string {
    if (!(error instanceof ApiError)) {
        return t('errors.generic');
    }
    const key: SpendingErrorKey | undefined =
        (context === 'sync' ? SPENDING_SYNC_ERROR_KEYS[error.problem.type] : undefined) ?? SPENDING_ERROR_KEYS[error.problem.type];
    return t(key ?? 'errors.generic');
}
