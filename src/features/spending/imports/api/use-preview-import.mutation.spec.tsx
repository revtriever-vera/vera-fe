import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { track } from '@/shared/lib/analytics';
import { ApiError } from '@/shared/lib/api/api-error';
import { readImportForm, type ImportRequestForm } from '../../../../../test/helpers/import-request';
import { ofxPreview } from '../../../../../test/fixtures/spending';
import { statementFile, stubNodeMultipart } from '../../../../../test/helpers/node-multipart';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { usePreviewImport } from './use-preview-import.mutation';

let OFX: File;

beforeEach(async () => {
    await stubNodeMultipart();
    OFX = statementFile('OFXHEADER:100', 'extrato.ofx', 'application/x-ofx');
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('usePreviewImport', () => {
    it('envia o arquivo em multipart e devolve a prévia', async () => {
        const received: ImportRequestForm[] = [];
        server.use(
            http.post('*/spending/imports/preview', async ({ request }) => {
                received.push(await readImportForm(request));
                return HttpResponse.json(ofxPreview());
            })
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => usePreviewImport(), { wrapper });

        act(() => {
            result.current.mutate({ file: OFX });
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });
        expect(result.current.data?.rows).toBe(6);
        expect(received).toEqual([{ fileText: 'OFXHEADER:100', fields: {} }]);
        expect(vi.mocked(track)).toHaveBeenCalledWith('spending_import_previewed', { format: 'ofx' });
    });

    it('expõe o ApiError de um formato não reconhecido', async () => {
        server.use(
            http.post('*/spending/imports/preview', () =>
                HttpResponse.json(
                    { type: 'imports.unsupported_format', title: 'x', status: 422, detail: 'bad', requestId: null },
                    { status: 422 }
                )
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => usePreviewImport(), { wrapper });

        act(() => {
            result.current.mutate({ file: OFX });
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });
        expect(result.current.error).toBeInstanceOf(ApiError);
        expect(result.current.error?.problem.type).toBe('imports.unsupported_format');
    });
});
