import { http, HttpResponse } from 'msw';
import type { HoldingView } from '@/features/portfolio/types';
import type { CreatePositionBody } from '@/features/portfolio/assets/types';
import { catalogAsset, positionView, quote } from '../fixtures/assets';
import { holding, SAMPLE_AS_OF } from '../fixtures/portfolio';
import { server } from '../msw/server';

export interface WalletApi {
    readonly deleted: string[];
    readonly holdings: () => readonly HoldingView[];
}

export function mockWalletApi(initial: readonly HoldingView[]): WalletApi {
    let current: HoldingView[] = [...initial];
    const deleted: string[] = [];
    server.use(
        http.get('*/portfolio/holdings', () => HttpResponse.json({ baseCurrency: 'BRL', asOf: SAMPLE_AS_OF, data: current })),
        http.get('*/catalog/assets', () => HttpResponse.json({ data: [catalogAsset()] })),
        http.get('*/market-data/quotes', () => HttpResponse.json({ quotes: [quote('asset-itub4', '37.80')], pendingAssetIds: [] })),
        http.post('*/positions', async ({ request }) => {
            const body: CreatePositionBody = (await request.json()) as CreatePositionBody;
            current = [
                ...current,
                holding({ id: 'position-new', symbol: 'ITUB4', quantity: body.quantity, valueMinor: 378000, nativeValueMinor: 378000 })
            ];
            return HttpResponse.json(positionView({ assetId: body.assetId, quantity: body.quantity }), { status: 201 });
        }),
        http.delete('*/positions/:id', ({ params }) => {
            deleted.push(`positions/${String(params['id'])}`);
            current = current.filter((item: HoldingView): boolean => item.id !== params['id']);
            return new HttpResponse(null, { status: 204 });
        }),
        http.delete('*/fixed-income/titles/:id', ({ params }) => {
            deleted.push(`fixed-income/titles/${String(params['id'])}`);
            current = current.filter((item: HoldingView): boolean => item.id !== params['id']);
            return new HttpResponse(null, { status: 204 });
        })
    );
    return { deleted, holdings: (): readonly HoldingView[] => current };
}
