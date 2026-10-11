import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import { ApiError } from '@/shared/lib/api/api-error';
import { importCreated } from '../../../../../test/fixtures/spending';
import { readImportForm, type ImportRequestForm } from '../../../../../test/helpers/import-request';
import { statementFile, stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { spendingKeys } from '../../api/spending-keys';
import { useCommitImport } from './use-commit-import.mutation';

describe('useCommitImport', () => {
    let file: File;

    beforeEach(async () => {
        await stubNodeMultipart();
        file = statementFile('OFXHEADER:100', 'extrato.ofx');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('envia arquivo, formato e conta, mede e invalida os gastos', async () => {
        const received: ImportRequestForm[] = [];
        server.use(
            http.post('*/spending/imports', async ({ request }) => {
                received.push(await readImportForm(request));
                return HttpResponse.json(importCreated(), { status: 201 });
            })
        );
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const invalidate: MockInstance = vi.spyOn(client, 'invalidateQueries');
        const { result } = renderHook(() => useCommitImport(), { wrapper });

        act(() => {
            result.current.mutate({ file, format: 'ofx', target: { accountId: 'acc-1' } });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
        expect(received).toEqual([{ fileText: 'OFXHEADER:100', fields: { format: 'ofx', accountId: 'acc-1' } }]);
        expect(vi.mocked(track)).toHaveBeenCalledWith('spending_import_completed', { format: 'ofx', inserted: 4, duplicates: 2 });
        const keys: unknown[] = invalidate.mock.calls.map((call: unknown[]): unknown => (call[0] as { queryKey?: unknown }).queryKey);
        expect(keys).toEqual(
            expect.arrayContaining([spendingKeys.transactionLists(), spendingKeys.accounts(), spendingKeys.importLists()])
        );
    });

    it('expõe o ApiError e não mede quando falha', async () => {
        server.use(
            http.post('*/spending/imports', () =>
                HttpResponse.json(
                    { type: 'imports.file_too_large', title: 'x', status: 413, detail: 'd', requestId: null },
                    { status: 413 }
                )
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useCommitImport(), { wrapper });

        act(() => {
            result.current.mutate({ file, format: 'ofx', target: { accountId: 'acc-1' } });
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.error?.problem.type).toBe('imports.file_too_large');
        expect(vi.mocked(track)).not.toHaveBeenCalledWith('spending_import_completed', expect.anything());
    });
});
