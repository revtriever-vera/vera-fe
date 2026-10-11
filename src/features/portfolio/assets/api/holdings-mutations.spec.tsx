import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { portfolioKeys } from '../../api/portfolio-keys';
import { mockHoldingsApi, type HoldingsApi } from '../../../../../test/helpers/holdings-api';
import { problem } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { useDeleteHolding } from './use-delete-holding.mutation';
import { useExportPortfolio } from './use-export-portfolio.mutation';
import { useFixedIncomeTitle } from './use-fixed-income-title.query';
import { useReclassify } from './use-reclassify.mutation';
import { useUpdateFixedIncomeTitle } from './use-update-fixed-income-title.mutation';

function invalidated(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

describe('mutações da lista de ativos', () => {
    it('useReclassify envia o PUT e invalida a carteira', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useReclassify(), { wrapper });

        act(() => {
            result.current.mutate({ subjectType: 'fixed_income', subjectId: 't1', classId: 'c1' });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.reclassified).toEqual([{ path: 'fixed_income/t1', body: { classId: 'c1' } }]);
        expect(invalidated(spy)).toContainEqual(portfolioKeys.holdings());
    });

    it('useReclassify devolve o ApiError', async () => {
        server.use(http.put('*/allocation/assignments/:type/:id', () => problem('allocation.class_not_found', 404)));
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useReclassify(), { wrapper });

        act(() => {
            result.current.mutate({ subjectType: 'position', subjectId: 'p', classId: 'x' });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect((result.current.error as ApiError).problem.type).toBe('allocation.class_not_found');
    });

    it('useDeleteHolding escolhe a rota pelo tipo e invalida', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useDeleteHolding(), { wrapper });

        act(() => {
            result.current.mutate({ kind: 'position', id: 'p1' });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
        act(() => {
            result.current.mutate({ kind: 'fixed_income', id: 't1' });
        });
        await waitFor(() => {
            expect(api.deleted).toEqual(['position/p1', 'title/t1']);
        });

        expect(invalidated(spy)).toContainEqual(portfolioKeys.holdings());
    });

    it('useDeleteHolding devolve o erro', async () => {
        server.use(http.delete('*/positions/:id', () => problem('positions.position_not_found', 404)));
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useDeleteHolding(), { wrapper });

        act(() => {
            result.current.mutate({ kind: 'position', id: 'p1' });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
    });

    it('useExportPortfolio falha com o ApiError do 429', async () => {
        mockHoldingsApi({ exportStatus: 429 });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useExportPortfolio(), { wrapper });

        act(() => {
            result.current.mutate({ format: 'csv' });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect((result.current.error as ApiError).status).toBe(429);
    });

    it('useFixedIncomeTitle lê o título e useUpdateFixedIncomeTitle grava', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result: query } = renderHook(() => useFixedIncomeTitle('t9'), { wrapper });
        await waitFor(() => {
            expect(query.current.data?.id).toBe('t9');
        });
        const { result: update } = renderHook(() => useUpdateFixedIncomeTitle(), { wrapper });

        act(() => {
            update.current.mutate({ id: 't9', body: { rateBps: 11200 } });
        });
        await waitFor(() => {
            expect(update.current.isSuccess).toBe(true);
        });

        expect(api.titlePatched).toEqual([{ id: 't9', body: { rateBps: 11200 } }]);
        expect(invalidated(spy)).toContainEqual(portfolioKeys.fixedIncomeTitle('t9'));
    });
});
