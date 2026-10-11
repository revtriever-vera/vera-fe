import { http, HttpResponse } from 'msw';
import type { BaseCurrency, Overview, UpdatePortfolioSettings } from '@/features/portfolio/types';
import { defaultClasses, portfolioSettings, sampleOverview, usdOverview } from '../fixtures/portfolio';
import { server } from '../msw/server';

export interface OverviewApiOptions {
    readonly overview?: Overview;
    readonly failures?: number;
}

export interface OverviewApi {
    readonly overviewCalls: () => number;
    readonly settingsPatches: readonly UpdatePortfolioSettings[];
}

export function installOverviewApi(options: OverviewApiOptions = {}): OverviewApi {
    let currency: BaseCurrency = 'BRL';
    let calls: number = 0;
    let remainingFailures: number = options.failures ?? 0;
    const patches: UpdatePortfolioSettings[] = [];
    server.use(
        http.get('*/portfolio/overview', (): Response => {
            calls += 1;
            if (remainingFailures > 0) {
                remainingFailures -= 1;
                return HttpResponse.json(
                    { type: 'internal', title: 'x', status: 500, detail: 'falhou', requestId: 'req-123' },
                    { status: 500 }
                );
            }
            return HttpResponse.json(options.overview ?? (currency === 'USD' ? usdOverview() : sampleOverview()));
        }),
        http.get('*/allocation/classes', () => HttpResponse.json(defaultClasses())),
        http.get('*/allocation/settings', () => HttpResponse.json(portfolioSettings({ baseCurrency: currency }))),
        http.put('*/allocation/settings', async ({ request }) => {
            const patch: UpdatePortfolioSettings = (await request.json()) as UpdatePortfolioSettings;
            patches.push(patch);
            currency = patch.baseCurrency ?? currency;
            return HttpResponse.json(portfolioSettings({ baseCurrency: currency }));
        })
    );
    return { overviewCalls: (): number => calls, settingsPatches: patches };
}
