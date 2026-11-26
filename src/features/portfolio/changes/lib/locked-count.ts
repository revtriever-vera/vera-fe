import { ApiError } from '@/shared/lib/api/api-error';
import { LOCKED_ERROR_TYPE } from '../types';

export interface ChangesLock {
    readonly documentCount: number | null;
}

export function changesLockOf(error: Error | null): ChangesLock | null {
    if (!(error instanceof ApiError) || error.status !== 402 || error.problem.type !== LOCKED_ERROR_TYPE) {
        return null;
    }
    const count: unknown = error.problem.meta?.['documentCount'];
    return { documentCount: typeof count === 'number' && Number.isInteger(count) && count > 0 ? count : null };
}
