import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { problem } from '../../../../../test/helpers/classes-api';
import { installTargetsApi, type TargetsApi } from '../../../../../test/helpers/targets-api';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { portfolioKeys } from '../../api/portfolio-keys';
import { useResetTargets } from './use-reset-targets.mutation';
import { useSaveClassTargets } from './use-save-class-targets.mutation';

function invalidatedKeys(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

const EXPECTED: unknown[] = [
    portfolioKeys.holdings(),
    portfolioKeys.overview(),
    portfolioKeys.classes(),
    portfolioKeys.classDetails(),
    portfolioKeys.contributions()
];

describe('useSaveClassTargets', () => {
    it('envia o corpo, grava as classes devolvidas e invalida a carteira', async () => {
        const api: TargetsApi = installTargetsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useSaveClassTargets(), { wrapper });

        act(() => {
            result.current.mutate({ targets: [{ classId: 'class-cripto', targetBps: 500 }] });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests).toEqual([
            { method: 'PUT', path: '/allocation/targets/classes', body: { targets: [{ classId: 'class-cripto', targetBps: 500 }] } }
        ]);
        expect(client.getQueryData(portfolioKeys.classes())).toEqual({ data: api.current() });
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED);
    });

    it('expõe o 422 com meta.sumBps como ApiError', async () => {
        server.use(
            http.put('*/allocation/targets/classes', () =>
                HttpResponse.json(
                    {
                        type: 'allocation.targets_must_sum_100',
                        title: 'x',
                        status: 422,
                        detail: 'd',
                        requestId: null,
                        meta: { sumBps: 9900 }
                    },
                    { status: 422 }
                )
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useSaveClassTargets(), { wrapper });

        act(() => {
            result.current.mutate({ targets: [] });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.error?.problem.type).toBe('allocation.targets_must_sum_100');
        expect(result.current.error?.problem.meta).toEqual({ sumBps: 9900 });
    });
});

describe('useResetTargets', () => {
    it('chama o reset, grava as classes e invalida a carteira', async () => {
        const api: TargetsApi = installTargetsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useResetTargets(), { wrapper });

        act(() => {
            result.current.mutate();
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests).toEqual([{ method: 'POST', path: '/allocation/targets/reset', body: null }]);
        expect(client.getQueryData(portfolioKeys.classes())).toEqual({ data: api.current() });
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED);
    });

    it('expõe o erro da API', async () => {
        server.use(http.post('*/allocation/targets/reset', () => problem('validation_failed', 400)));
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useResetTargets(), { wrapper });

        act(() => {
            result.current.mutate();
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.problem.type).toBe('validation_failed');
    });
});
