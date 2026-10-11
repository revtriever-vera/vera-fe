import { http, HttpResponse, type RequestHandler } from 'msw';
import type { UpdatePortfolioSettings } from '@/features/portfolio/types';
import { defaultClasses, emptyHoldings, emptyOverview, portfolioSettings } from '../../fixtures/portfolio';

export function portfolioHandlers(): RequestHandler[] {
    return [
        http.get('*/portfolio/holdings', () => HttpResponse.json(emptyHoldings())),
        http.get('*/portfolio/overview', () => HttpResponse.json(emptyOverview())),
        http.get('*/allocation/classes', () => HttpResponse.json(defaultClasses())),
        http.get('*/allocation/settings', () => HttpResponse.json(portfolioSettings())),
        http.put('*/allocation/settings', async ({ request }) => {
            const patch: UpdatePortfolioSettings = (await request.json()) as UpdatePortfolioSettings;
            return HttpResponse.json(portfolioSettings(patch));
        })
    ];
}
