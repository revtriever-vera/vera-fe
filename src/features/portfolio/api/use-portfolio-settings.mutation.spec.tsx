import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { server } from '../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../test/render';
import { invalidatePortfolio } from './invalidate-portfolio';
import { portfolioKeys } from './portfolio-keys';
import { useUpdatePortfolioSettings } from './use-portfolio-settings.mutation';

function invalidatedKeys(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

describe('useUpdatePortfolioSettings', () => {
    it('grava a moeda base e invalida settings, carteira, visão geral e aporte', async () => {
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useUpdatePortfolioSettings(), { wrapper });

        act(() => {
            result.current.mutate({ baseCurrency: 'USD' });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual({ baseCurrency: 'USD', toleranceBps: 500 });
        expect(client.getQueryData(portfolioKeys.settings())).toEqual({ baseCurrency: 'USD', toleranceBps: 500 });
        const keys: unknown[] = invalidatedKeys(invalidate);
        expect(keys).toEqual(
            expect.arrayContaining([
                portfolioKeys.settings(),
                portfolioKeys.holdings(),
                portfolioKeys.overview(),
                portfolioKeys.contributions()
            ])
        );
    });

    it('expõe o ApiError quando a gravação falha', async () => {
        server.use(
            http.put('*/allocation/settings', () =>
                HttpResponse.json({ type: 'validation_failed', title: 'x', status: 422, detail: 'bad', requestId: null }, { status: 422 })
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useUpdatePortfolioSettings(), { wrapper });

        act(() => {
            result.current.mutate({ toleranceBps: 9999 });
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
    });
});

describe('invalidatePortfolio', () => {
    it('invalida carteira, visão geral, classes e detalhes de classe', async () => {
        const { client }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');

        await invalidatePortfolio(client);

        const keys: unknown[] = invalidatedKeys(invalidate);
        expect(keys).toEqual([portfolioKeys.holdings(), portfolioKeys.overview(), portfolioKeys.classes(), portfolioKeys.classDetails()]);
    });
});
