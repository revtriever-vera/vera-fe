import { http, HttpResponse } from 'msw';
import type { InvestmentImportCreated, InvestmentImportList, InvestmentPreview } from '@/features/portfolio/imports/types';
import { investmentImportCreated, investmentImportList, investmentPreview } from '../fixtures/investment-imports';
import { server } from '../msw/server';
import { readImportForm, type ImportRequestForm } from './import-request';

export interface InvestmentImportApiOptions {
    readonly preview?: InvestmentPreview;
    readonly created?: InvestmentImportCreated;
    readonly list?: InvestmentImportList;
    readonly previewStatus?: number;
    readonly commitStatus?: number;
    readonly undoStatus?: number;
    readonly previewType?: string;
    readonly commitType?: string;
}

export interface InvestmentImportApi {
    readonly previews: ImportRequestForm[];
    readonly commits: Record<string, unknown>[];
    readonly undone: string[];
}

function failure(type: string, status: number): Response {
    return HttpResponse.json({ type, title: 'x', status, detail: 'detail', requestId: null }, { status });
}

export function mockInvestmentImportApi(options: InvestmentImportApiOptions = {}): InvestmentImportApi {
    const api: InvestmentImportApi = { previews: [], commits: [], undone: [] };
    server.use(
        http.post('*/investment-imports/preview', async ({ request }) => {
            api.previews.push(await readImportForm(request));
            if (options.previewStatus !== undefined) {
                return failure(options.previewType ?? 'format.not_recognized', options.previewStatus);
            }
            return HttpResponse.json(options.preview ?? investmentPreview());
        }),
        http.post('*/investment-imports', async ({ request }) => {
            api.commits.push((await request.json()) as Record<string, unknown>);
            if (options.commitStatus !== undefined) {
                return failure(options.commitType ?? 'preview.expired', options.commitStatus);
            }
            return HttpResponse.json(options.created ?? investmentImportCreated(), { status: 201 });
        }),
        http.get('*/investment-imports', () => HttpResponse.json(options.list ?? investmentImportList())),
        http.delete('*/investment-imports/:id', ({ params }) => {
            api.undone.push(String(params['id']));
            if (options.undoStatus !== undefined) {
                return failure('import.undo_blocked', options.undoStatus);
            }
            return HttpResponse.json({ undone: true });
        })
    );
    return api;
}
