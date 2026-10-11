import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

const TOO_MANY_REQUESTS: number = 429;
const EXPORT_TOO_LARGE: string = 'transactions.export_too_large';

export function exportErrorMessage(t: TFunction<'spendingTransactions'>, error: Error): string {
    if (error instanceof ApiError && error.problem.type === EXPORT_TOO_LARGE) {
        return t('export.tooLarge');
    }
    if (error instanceof ApiError && error.status === TOO_MANY_REQUESTS) {
        return t('export.rateLimited');
    }
    return t('export.failed');
}
