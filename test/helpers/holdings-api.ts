import { http, HttpResponse } from 'msw';
import type { HoldingsResponse } from '@/features/portfolio/types';
import { positionView, titleView } from '../fixtures/assets';
import { defaultClasses, sampleHoldings } from '../fixtures/portfolio';
import { server } from '../msw/server';
import { problem } from './assets-api';

export interface HoldingsApiOptions {
    readonly holdings?: HoldingsResponse;
    readonly exportStatus?: number;
    readonly holdingsStatus?: number;
}

export interface HoldingsApi {
    readonly reclassified: { path: string; body: unknown }[];
    readonly patched: { id: string; body: unknown }[];
    readonly titlePatched: { id: string; body: unknown }[];
    readonly deleted: string[];
    readonly exported: string[];
}

export function mockHoldingsApi({
    holdings = sampleHoldings(),
    exportStatus = 200,
    holdingsStatus = 200
}: HoldingsApiOptions = {}): HoldingsApi {
    const api: HoldingsApi = { reclassified: [], patched: [], titlePatched: [], deleted: [], exported: [] };
    server.use(
        http.get('*/portfolio/holdings', () =>
            holdingsStatus === 200 ? HttpResponse.json(holdings) : problem('core.internal', holdingsStatus)
        ),
        http.get('*/allocation/classes', () => HttpResponse.json(defaultClasses())),
        http.put('*/allocation/assignments/:type/:id', async ({ request, params }) => {
            const body: { classId: string } = (await request.json()) as { classId: string };
            api.reclassified.push({ path: `${String(params['type'])}/${String(params['id'])}`, body });
            return HttpResponse.json({ subjectType: params['type'], subjectId: params['id'], classId: body.classId, targetInClassBps: 0 });
        }),
        http.patch('*/positions/:id', async ({ request, params }) => {
            api.patched.push({ id: String(params['id']), body: await request.json() });
            return HttpResponse.json(positionView({ id: String(params['id']) }));
        }),
        http.get('*/fixed-income/titles/:id', ({ params }) =>
            HttpResponse.json(titleView({ id: String(params['id']), name: 'CDB Inter' }))
        ),
        http.patch('*/fixed-income/titles/:id', async ({ request, params }) => {
            api.titlePatched.push({ id: String(params['id']), body: await request.json() });
            return HttpResponse.json(titleView({ id: String(params['id']) }));
        }),
        http.delete('*/positions/:id', ({ params }) => {
            api.deleted.push(`position/${String(params['id'])}`);
            return new HttpResponse(null, { status: 204 });
        }),
        http.delete('*/fixed-income/titles/:id', ({ params }) => {
            api.deleted.push(`title/${String(params['id'])}`);
            return new HttpResponse(null, { status: 204 });
        }),
        http.get('*/portfolio/export', ({ request }) => {
            const format: string = new URL(request.url).searchParams.get('format') ?? '';
            api.exported.push(format);
            if (exportStatus !== 200) {
                return problem('core.too_many_attempts', exportStatus);
            }
            return new HttpResponse('data', {
                headers: {
                    'content-type': 'application/octet-stream',
                    'content-disposition': `attachment; filename="vera-carteira-2026-10-11.${format}"`
                }
            });
        })
    );
    return api;
}
