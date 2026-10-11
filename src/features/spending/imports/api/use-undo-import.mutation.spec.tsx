import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { spendingKeys } from '../../api/spending-keys';
import { useUndoImport } from './use-undo-import.mutation';

describe('useUndoImport', () => {
    it('chama o DELETE com o id, mede e invalida os gastos', async () => {
        const ids: string[] = [];
        server.use(
            http.delete('*/spending/imports/:id', ({ params }) => {
                ids.push(String(params['id']));
                return HttpResponse.json({ removed: 4 });
            })
        );
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useUndoImport(), { wrapper });

        act(() => {
            result.current.mutate('imp-1');
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
        expect(ids).toEqual(['imp-1']);
        expect(result.current.data).toEqual({ removed: 4 });
        expect(vi.mocked(track)).toHaveBeenCalledWith('spending_import_undone');
        const keys: unknown[] = invalidate.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown }).queryKey);
        expect(keys).toEqual(expect.arrayContaining([spendingKeys.importLists(), spendingKeys.transactionLists()]));
    });

    it('expõe o erro quando o lote não existe', async () => {
        server.use(
            http.delete('*/spending/imports/:id', () =>
                HttpResponse.json(
                    { type: 'imports.import_not_found', title: 'x', status: 404, detail: 'd', requestId: null },
                    { status: 404 }
                )
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useUndoImport(), { wrapper });

        act(() => {
            result.current.mutate('imp-9');
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
        expect(result.current.error?.problem.type).toBe('imports.import_not_found');
    });
});
