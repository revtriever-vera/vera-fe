import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor, type RenderHookResult } from '@testing-library/react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AssetClassView } from '../../types';
import type { MergeClassesInput } from './use-merge-classes.mutation';
import type { UpdateClassInput } from './use-update-class.mutation';
import { ApiError } from '@/shared/lib/api/api-error';
import { installClassesApi, problem, type ClassesApi } from '../../../../../test/helpers/classes-api';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { http } from 'msw';
import { portfolioKeys } from '../../api/portfolio-keys';
import { useCreateClass } from './use-create-class.mutation';
import { useDeleteClass } from './use-delete-class.mutation';
import { useMergeClasses } from './use-merge-classes.mutation';
import { useUpdateClass } from './use-update-class.mutation';

type UseMergeResult = UseMutationResult<AssetClassView, ApiError, MergeClassesInput>;
type UseUpdateResult = UseMutationResult<AssetClassView, ApiError, UpdateClassInput>;

const EXPECTED_KEYS: unknown[] = [
    portfolioKeys.holdings(),
    portfolioKeys.overview(),
    portfolioKeys.classes(),
    portfolioKeys.classDetails()
];

function invalidatedKeys(spy: MockInstance): unknown[] {
    return spy.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown } | undefined)?.queryKey);
}

describe('mutações de classes: sucesso', () => {
    it('useCreateClass envia o POST e invalida a carteira inteira', async () => {
        const api: ClassesApi = installClassesApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useCreateClass(), { wrapper });

        act(() => {
            result.current.mutate({ name: 'Previdência', colorKey: 'c9' });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests).toEqual([{ method: 'POST', path: '/allocation/classes', body: { name: 'Previdência', colorKey: 'c9' } }]);
        expect(result.current.data?.targetBps).toBe(0);
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED_KEYS);
    });

    it('useUpdateClass envia o PATCH com name nulo para restaurar o nome padrão', async () => {
        const api: ClassesApi = installClassesApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useUpdateClass(), { wrapper });

        act(() => {
            result.current.mutate({ id: 'class-fii', body: { name: null } });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests).toEqual([{ method: 'PATCH', path: '/allocation/classes/class-fii', body: { name: null } }]);
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED_KEYS);
    });

    it('useMergeClasses envia intoClassId e invalida a carteira inteira', async () => {
        const api: ClassesApi = installClassesApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useMergeClasses(), { wrapper });

        act(() => {
            result.current.mutate({ id: 'class-fii', intoClassId: 'class-reits' });
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests[0]).toEqual({
            method: 'POST',
            path: '/allocation/classes/class-fii/merge',
            body: { intoClassId: 'class-reits' }
        });
        expect(result.current.data?.targetBps).toBe(1500);
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED_KEYS);
    });

    it('useDeleteClass envia o DELETE e invalida a carteira inteira', async () => {
        const api: ClassesApi = installClassesApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useDeleteClass(), { wrapper });

        act(() => {
            result.current.mutate('class-cripto');
        });
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.requests).toEqual([{ method: 'DELETE', path: '/allocation/classes/class-cripto', body: null }]);
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED_KEYS);
    });
});

describe('mutações de classes: erros por código', () => {
    it.each([
        ['allocation.class_name_taken', 409],
        ['allocation.class_limit_reached', 422]
    ])('useCreateClass expõe %s e relê a carteira', async (code: string, status: number) => {
        server.use(http.post('*/allocation/classes', () => problem(code, status)));
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useCreateClass(), { wrapper });

        act(() => {
            result.current.mutate({ name: 'FIIs' });
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.error?.problem.type).toBe(code);
        expect(invalidatedKeys(invalidate)).toEqual(EXPECTED_KEYS);
    });

    it.each([
        ['allocation.class_not_empty', 409],
        ['allocation.system_class_not_deletable', 422]
    ])('useDeleteClass expõe %s', async (code: string, status: number) => {
        server.use(http.delete('*/allocation/classes/:id', () => problem(code, status)));
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useDeleteClass(), { wrapper });

        act(() => {
            result.current.mutate('class-fii');
        });
        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.problem.type).toBe(code);
    });

    it('useMergeClasses e useUpdateClass expõem o código da API', async () => {
        server.use(
            http.post('*/allocation/classes/:id/merge', () => problem('allocation.cannot_merge_into_self', 422)),
            http.patch('*/allocation/classes/:id', () => problem('allocation.class_name_taken', 409))
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const merge: RenderHookResult<UseMergeResult, void> = renderHook(() => useMergeClasses(), { wrapper });
        const update: RenderHookResult<UseUpdateResult, void> = renderHook(() => useUpdateClass(), { wrapper });

        act(() => {
            merge.result.current.mutate({ id: 'a', intoClassId: 'a' });
            update.result.current.mutate({ id: 'a', body: { name: 'x' } });
        });
        await waitFor(() => {
            expect(merge.result.current.isError).toBe(true);
            expect(update.result.current.isError).toBe(true);
        });

        expect(merge.result.current.error?.problem.type).toBe('allocation.cannot_merge_into_self');
        expect(update.result.current.error?.problem.type).toBe('allocation.class_name_taken');
    });
});
