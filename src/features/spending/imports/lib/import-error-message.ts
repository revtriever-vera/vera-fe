import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { spendingErrorMessage } from '../../lib/spending-error-message';

export interface ImportCurrencies {
    readonly statement: string | null;
    readonly account: string | null;
}

const CURRENCY_MISMATCH: string = 'imports.currency_mismatch';

export function importErrorMessage(
    t: TFunction<'spending'>,
    tImports: TFunction<'spendingImports'>,
    error: Error | null,
    currencies: ImportCurrencies
): string {
    const known: boolean = error instanceof ApiError && error.problem.type === CURRENCY_MISMATCH;
    if (known && currencies.statement !== null && currencies.account !== null) {
        return tImports('errors.currencyMismatch', { statement: currencies.statement, account: currencies.account });
    }
    return spendingErrorMessage(t, error);
}
