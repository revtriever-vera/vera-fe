import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';

const TOO_MANY_REQUESTS: number = 429;

export function exportErrorMessage(t: TFunction<'portfolioAssets'>, tp: TFunction<'portfolio'>, error: Error): string {
    if (error instanceof ApiError && error.status === TOO_MANY_REQUESTS) {
        return t('export.rateLimited');
    }
    if (error instanceof ApiError && error.status < 500) {
        return portfolioErrorMessage(tp, error);
    }
    return t('export.failed');
}
