import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { importView } from '../../../../../test/fixtures/spending';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { IMPORTS_PAGE_SIZE, useImports } from './use-imports.query';

describe('useImports', () => {
    it('pede a página e o tamanho e devolve a lista', async () => {
        const queries: string[] = [];
        server.use(
            http.get('*/spending/imports', ({ request }) => {
                queries.push(new URL(request.url).search);
                return HttpResponse.json({
                    data: [importView()],
                    pagination: { page: 2, pageSize: IMPORTS_PAGE_SIZE, totalRecords: 11, totalPages: 2 }
                });
            })
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();

        const { result } = renderHook(() => useImports(2), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
        expect(result.current.data?.data[0]?.fileName).toBe('vera-qa-nubank-cartao.ofx');
        expect(queries).toEqual([`?page=2&pageSize=${String(IMPORTS_PAGE_SIZE)}`]);
    });
});
