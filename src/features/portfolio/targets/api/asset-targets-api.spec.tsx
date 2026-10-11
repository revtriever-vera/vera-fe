import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError } from '@/shared/lib/api/api-error';
import { classDetail } from '../../../../../test/fixtures/class-detail';
import { installClassDetailApi, type ClassDetailApi } from '../../../../../test/helpers/class-detail-api';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import type { AssetTargetsInput } from '../types';
import { portfolioKeys } from '../../api/portfolio-keys';
import { useClassDetail } from './use-class-detail.query';
import { useSaveAssetTargets } from './use-save-asset-targets.mutation';

const BODY: AssetTargetsInput = {
    targets: [
        { subjectType: 'position', subjectId: 'position-itub4', targetInClassBps: 3000 },
        { subjectType: 'position', subjectId: 'position-wege3', targetInClassBps: 4000 },
        { subjectType: 'position', subjectId: 'position-petr4', targetInClassBps: 3000 }
    ]
};

function invalidatedKeys(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

describe('useClassDetail', () => {
    it('busca o detalhe da classe pela chave classDetail', async () => {
        installClassDetailApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useClassDetail('class-acoes-br'), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(classDetail());
        expect(client.getQueryData(portfolioKeys.classDetail('class-acoes-br'))).toEqual(classDetail());
    });

    it('expõe o 404 allocation.class_not_found como ApiError', async () => {
        installClassDetailApi({ missingClass: true });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useClassDetail('class-x'), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect((result.current.error as ApiError).problem.type).toBe('allocation.class_not_found');
    });
});

describe('useSaveAssetTargets', () => {
    it('envia o corpo completo e invalida detalhe, visão geral e aporte', async () => {
        const api: ClassDetailApi = installClassDetailApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useSaveAssetTargets('class-acoes-br'), { wrapper });

        act(() => {
            result.current.mutate(BODY);
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests).toEqual([{ method: 'PUT', path: '/allocation/targets/classes/class-acoes-br/assets', body: BODY }]);
        const keys: unknown[] = invalidatedKeys(invalidate);
        expect(keys).toContainEqual(portfolioKeys.classDetail('class-acoes-br'));
        expect(keys).toContainEqual(portfolioKeys.overview());
        expect(keys).toContainEqual(portfolioKeys.contributions());
    });

    it.each(['allocation.targets_incomplete', 'allocation.targets_must_sum_100'])('expõe o 422 %s como ApiError', async (type: string) => {
        installClassDetailApi({ saveFailure: { type, status: 422 } });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useSaveAssetTargets('class-acoes-br'), { wrapper });

        act(() => {
            result.current.mutate(BODY);
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.problem.type).toBe(type);
    });
});
