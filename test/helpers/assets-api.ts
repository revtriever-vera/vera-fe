import { http, HttpResponse } from 'msw';
import type { HoldingsResponse } from '@/features/portfolio/types';
import type {
    CatalogAsset,
    CreatePositionBody,
    CreateTitleBody,
    FgcSimulation,
    FgcSimulationBody,
    FixedIncomePreview,
    FixedIncomePreviewBody,
    IssuerItem,
    PositionView,
    Quote
} from '@/features/portfolio/assets/types';
import { exchangeRate, fgcSimulation, issuerItem, positionView, previewResult, titleView } from '../fixtures/assets';
import { server } from '../msw/server';

export interface AssetsApiOptions {
    readonly assets?: readonly CatalogAsset[];
    readonly quotes?: readonly Quote[];
    readonly pending?: readonly string[];
    readonly holdings?: HoldingsResponse;
    readonly preview?: FixedIncomePreview;
    readonly issuers?: readonly IssuerItem[];
    readonly fgc?: FgcSimulation;
}

export interface AssetsApi {
    readonly searches: string[];
    readonly quoteRequests: string[];
    readonly positionBodies: CreatePositionBody[];
    readonly patchBodies: { id: string; body: unknown }[];
    readonly previewBodies: FixedIncomePreviewBody[];
    readonly titleBodies: CreateTitleBody[];
    readonly issuerSearches: string[];
    readonly fgcBodies: FgcSimulationBody[];
}

export function mockAssetsApi({
    assets = [],
    quotes = [],
    pending = [],
    holdings,
    preview = previewResult(),
    issuers = [
        issuerItem(),
        issuerItem({ id: 'petrobras', name: 'Petrobras', groupId: 'petrobras', groupName: 'Petrobras', kind: 'company' })
    ],
    fgc = fgcSimulation()
}: AssetsApiOptions = {}): AssetsApi {
    const api: AssetsApi = {
        searches: [],
        quoteRequests: [],
        positionBodies: [],
        patchBodies: [],
        previewBodies: [],
        titleBodies: [],
        issuerSearches: [],
        fgcBodies: []
    };
    server.use(
        http.get('*/catalog/assets', ({ request }) => {
            const url: URL = new URL(request.url);
            api.searches.push(`${url.searchParams.get('group') ?? ''}|${url.searchParams.get('q') ?? ''}`);
            const q: string = (url.searchParams.get('q') ?? '').toLowerCase();
            const data: CatalogAsset[] = assets.filter(
                (asset: CatalogAsset): boolean =>
                    asset.typeGroup === url.searchParams.get('group') && `${asset.symbol} ${asset.name}`.toLowerCase().includes(q)
            );
            return HttpResponse.json({ data });
        }),
        http.get('*/market-data/quotes', ({ request }) => {
            const ids: string[] = (new URL(request.url).searchParams.get('assetIds') ?? '').split(',');
            api.quoteRequests.push(ids.join(','));
            return HttpResponse.json({
                quotes: quotes.filter((item: Quote): boolean => ids.includes(item.assetId)),
                pendingAssetIds: pending.filter((id: string): boolean => ids.includes(id))
            });
        }),
        http.get('*/market-data/exchange-rates/:currency', () => HttpResponse.json(exchangeRate())),
        http.get('*/issuers', ({ request }) => {
            const url: URL = new URL(request.url);
            const kind: string = url.searchParams.get('kind') ?? '';
            const q: string = (url.searchParams.get('q') ?? '').toLowerCase();
            api.issuerSearches.push(`${kind}|${q}`);
            const items: IssuerItem[] = issuers.filter(
                (item: IssuerItem): boolean =>
                    (item.kind === kind || item.kind === 'other') && `${item.name} ${item.groupName}`.toLowerCase().includes(q)
            );
            return HttpResponse.json({ items });
        }),
        http.post('*/portfolio/fgc/simulate', async ({ request }) => {
            api.fgcBodies.push((await request.json()) as FgcSimulationBody);
            return HttpResponse.json(fgc);
        }),
        http.post('*/fixed-income/preview', async ({ request }) => {
            api.previewBodies.push((await request.json()) as FixedIncomePreviewBody);
            return HttpResponse.json(preview);
        }),
        http.post('*/fixed-income/titles', async ({ request }) => {
            const body: CreateTitleBody = (await request.json()) as CreateTitleBody;
            api.titleBodies.push(body);
            return HttpResponse.json(titleView({ ...body, currency: body.currency ?? 'BRL', classId: body.classId ?? 'class-rf-pos' }), {
                status: 201
            });
        }),
        http.post('*/positions', async ({ request }) => {
            const body: CreatePositionBody = (await request.json()) as CreatePositionBody;
            api.positionBodies.push(body);
            return HttpResponse.json(
                positionView({ assetId: body.assetId, quantity: body.quantity, classId: body.classId ?? 'class-acoes-br' }),
                { status: 201 }
            );
        }),
        http.get('*/positions/:id', ({ params }) => HttpResponse.json(positionView({ id: String(params['id']) }))),
        http.patch('*/positions/:id', async ({ request, params }) => {
            const body: unknown = await request.json();
            api.patchBodies.push({ id: String(params['id']), body });
            const patch: Partial<PositionView> = body as Partial<PositionView>;
            return HttpResponse.json(positionView({ id: String(params['id']), ...patch }));
        })
    );
    if (holdings !== undefined) {
        server.use(http.get('*/portfolio/holdings', () => HttpResponse.json(holdings)));
    }
    return api;
}

export function problem(type: string, status: number, meta?: Record<string, unknown>): Response {
    return HttpResponse.json(
        { type, title: type, status, detail: type, requestId: null, ...(meta === undefined ? {} : { meta }) },
        { status }
    );
}
