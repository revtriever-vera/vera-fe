import { describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../test/render';
import { categoryId } from '../../../../test/fixtures/spending';
import { spendingKeys } from './spending-keys';
import { useUpdateCategoryFlexibility } from './use-update-category-flexibility.mutation';

describe('useUpdateCategoryFlexibility', () => {
    it('envia o PATCH e invalida o resumo, os cortes e as categorias', async () => {
        const bodies: unknown[] = [];
        server.use(
            http.patch('*/spending/categories/:id', async ({ request, params }) => {
                bodies.push({ id: params['id'], body: await request.json() });
                return HttpResponse.json({
                    id: params['id'],
                    systemKey: 'leisure',
                    name: null,
                    kind: 'expense',
                    flexibility: 'fixed',
                    icon: 'Film',
                    position: 8,
                    isSystem: true
                });
            })
        );
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useUpdateCategoryFlexibility(), { wrapper });

        act(() => {
            result.current.mutate({ id: categoryId('leisure'), flexibility: 'fixed' });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(bodies).toEqual([{ id: 'cat-leisure', body: { flexibility: 'fixed' } }]);
        const keys: unknown[] = invalidate.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown }).queryKey);
        expect(keys).toEqual(
            expect.arrayContaining([
                spendingKeys.summaries(),
                spendingKeys.cutsList(),
                spendingKeys.categories(),
                spendingKeys.transactionLists()
            ])
        );
    });
});
