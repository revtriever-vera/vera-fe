import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { portfolioKeys } from '../../api/portfolio-keys';
import type { CreateTitleBody } from '../types';
import { mockAssetsApi, problem, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { useCreateFixedIncomeTitle } from './use-create-fixed-income-title.mutation';
import { useCreatePosition } from './use-create-position.mutation';
import { useUpdatePosition } from './use-update-position.mutation';

const PORTFOLIO_KEYS: unknown[] = [
    portfolioKeys.holdings(),
    portfolioKeys.overview(),
    portfolioKeys.classes(),
    portfolioKeys.classDetails()
];

function invalidated(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

describe('mutações de ativos', () => {
    it('useCreatePosition envia o POST e invalida a carteira', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useCreatePosition(), { wrapper });

        act(() => {
            result.current.mutate({ assetId: 'asset-itub4', quantity: '100', classId: 'class-acoes-br' });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.positionBodies).toEqual([{ assetId: 'asset-itub4', quantity: '100', classId: 'class-acoes-br' }]);
        expect(invalidated(spy)).toEqual(PORTFOLIO_KEYS);
    });

    it('useCreatePosition devolve o 409 com a posição existente e ainda atualiza a carteira', async () => {
        server.use(http.post('*/positions', () => problem('positions.asset_already_in_portfolio', 409, { positionId: 'p-9' })));
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useCreatePosition(), { wrapper });

        act(() => {
            result.current.mutate({ assetId: 'a', quantity: '1' });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect((result.current.error as ApiError).problem.meta).toEqual({ positionId: 'p-9' });
        expect(invalidated(spy)).toEqual(PORTFOLIO_KEYS);
    });

    it('useUpdatePosition envia o PATCH e invalida a posição e a carteira', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useUpdatePosition(), { wrapper });

        act(() => {
            result.current.mutate({ id: 'p-1', body: { quantity: '5' } });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.patchBodies).toEqual([{ id: 'p-1', body: { quantity: '5' } }]);
        expect(invalidated(spy)).toEqual([...PORTFOLIO_KEYS, portfolioKeys.position('p-1')]);
    });

    it('useCreateFixedIncomeTitle envia o POST e invalida a carteira', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const spy: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useCreateFixedIncomeTitle(), { wrapper });
        const body: CreateTitleBody = {
            kind: 'cdb',
            indexer: 'cdi_percent',
            rateBps: 11000,
            appliedMinor: 5000000,
            appliedAt: '2025-03-10',
            maturityDate: '2028-03-10',
            name: 'CDB'
        };

        act(() => {
            result.current.mutate(body);
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.titleBodies).toEqual([body]);
        expect(invalidated(spy)).toEqual(PORTFOLIO_KEYS);
    });
});
