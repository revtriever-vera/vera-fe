import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { server } from '../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../test/render';
import { invalidateSpending } from './invalidate-spending';
import { spendingKeys } from './spending-keys';
import { useUpdateSpendingSettings } from './use-spending-settings.mutation';

function invalidatedKeys(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

describe('useUpdateSpendingSettings', () => {
    it('grava a renda declarada e invalida configurações, resumo e cortes', async () => {
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useUpdateSpendingSettings(), { wrapper });

        act(() => {
            result.current.mutate({ incomeMode: 'declared', declaredIncomeMinor: 500000 });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual({ savingsGoalBps: 2000, incomeMode: 'declared', declaredIncomeMinor: 500000 });
        expect(client.getQueryData(spendingKeys.settings())).toEqual(result.current.data);
        expect(invalidatedKeys(invalidate)).toEqual(
            expect.arrayContaining([spendingKeys.settings(), spendingKeys.summaries(), spendingKeys.cutsList()])
        );
    });

    it('expõe o ApiError quando a gravação falha', async () => {
        server.use(
            http.put('*/spending/settings', () =>
                HttpResponse.json(
                    { type: 'summary.declared_income_required', title: 'x', status: 422, detail: 'bad', requestId: null },
                    { status: 422 }
                )
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useUpdateSpendingSettings(), { wrapper });

        act(() => {
            result.current.mutate({ incomeMode: 'declared' });
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.error?.problem.type).toBe('summary.declared_income_required');
    });
});

describe('invalidateSpending', () => {
    it('invalida transações, contador, resumo, cortes, contas e importações', async () => {
        const { client }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');

        await invalidateSpending(client);

        expect(invalidatedKeys(invalidate)).toEqual([
            spendingKeys.transactionLists(),
            spendingKeys.uncategorizedCount(),
            spendingKeys.summaries(),
            spendingKeys.cutsList(),
            spendingKeys.accounts(),
            spendingKeys.importLists()
        ]);
    });
});
