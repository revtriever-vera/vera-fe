import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { changesLockOf } from './locked-count';

function error(status: number, type: string, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: 'Error', status, detail: 'x', requestId: null, meta });
}

describe('changesLockOf', () => {
    it('lê a contagem do 402 do plano', () => {
        expect(changesLockOf(error(402, 'plan.feature_locked', { documentCount: 3 }))).toEqual({ documentCount: 3 });
    });

    it('sem contagem válida devolve null na contagem', () => {
        expect(changesLockOf(error(402, 'plan.feature_locked'))).toEqual({ documentCount: null });
        expect(changesLockOf(error(402, 'plan.feature_locked', { documentCount: 0 }))).toEqual({ documentCount: null });
        expect(changesLockOf(error(402, 'plan.feature_locked', { documentCount: '3' }))).toEqual({ documentCount: null });
    });

    it('outro erro não é o cadeado', () => {
        expect(changesLockOf(error(402, 'billing.past_due'))).toBeNull();
        expect(changesLockOf(error(500, 'plan.feature_locked'))).toBeNull();
        expect(changesLockOf(new Error('x'))).toBeNull();
        expect(changesLockOf(null)).toBeNull();
    });
});
