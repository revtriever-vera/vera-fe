import { http, HttpResponse, type RequestHandler } from 'msw';
import type { UpdatePortfolioSettings } from '@/features/portfolio/types';
import { exchangeRate, fgcSimulation, positionView, previewResult, titleView } from '../../fixtures/assets';
import { emptyFgc, emptyMaturities, realRates } from '../../fixtures/fixed-income';
import { sampleSuggestion } from '../../fixtures/contribution';
import { investmentImportList } from '../../fixtures/investment-imports';
import { defaultClasses, emptyConcentration, emptyHoldings, emptyOverview, portfolioSettings } from '../../fixtures/portfolio';

export function portfolioHandlers(): RequestHandler[] {
    return [
        http.get('*/portfolio/holdings', () => HttpResponse.json(emptyHoldings())),
        http.get('*/portfolio/concentration', () => HttpResponse.json(emptyConcentration())),
        http.get('*/portfolio/overview', () => HttpResponse.json(emptyOverview())),
        http.get('*/portfolio/fgc', () => HttpResponse.json(emptyFgc())),
        http.get('*/portfolio/maturities', () => HttpResponse.json(emptyMaturities())),
        http.get('*/portfolio/real-rates', () => HttpResponse.json(realRates([]))),
        http.get('*/allocation/classes', () => HttpResponse.json(defaultClasses())),
        http.get('*/allocation/settings', () => HttpResponse.json(portfolioSettings())),
        http.post('*/portfolio/contributions/suggest', () => HttpResponse.json(sampleSuggestion())),
        http.get('*/investment-imports', () => HttpResponse.json(investmentImportList())),
        http.get('*/catalog/assets', () => HttpResponse.json({ data: [] })),
        http.get('*/market-data/quotes', () => HttpResponse.json({ quotes: [], pendingAssetIds: [] })),
        http.get('*/market-data/exchange-rates/:currency', () => HttpResponse.json(exchangeRate())),
        http.get('*/issuers', () => HttpResponse.json({ items: [] })),
        http.post('*/portfolio/fgc/simulate', () => HttpResponse.json(fgcSimulation())),
        http.post('*/fixed-income/preview', () => HttpResponse.json(previewResult())),
        http.post('*/fixed-income/titles', () => HttpResponse.json(titleView(), { status: 201 })),
        http.post('*/positions', () => HttpResponse.json(positionView(), { status: 201 })),
        http.get('*/positions/:id', () => HttpResponse.json(positionView())),
        http.patch('*/positions/:id', () => HttpResponse.json(positionView())),
        http.put('*/allocation/settings', async ({ request }) => {
            const patch: UpdatePortfolioSettings = (await request.json()) as UpdatePortfolioSettings;
            return HttpResponse.json(portfolioSettings(patch));
        })
    ];
}
