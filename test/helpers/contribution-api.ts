import { http, HttpResponse } from 'msw';
import type { BaseCurrency, PortfolioSettings } from '@/features/portfolio/types';
import type { ContributionSuggestion } from '@/features/portfolio/contribution/types';
import { portfolioSettings } from '../fixtures/portfolio';
import { sampleSuggestion } from '../fixtures/contribution';
import { server } from '../msw/server';

export interface ContributionApiOptions {
    readonly suggestion?: ContributionSuggestion;
    readonly failure?: { readonly type: string; readonly status: number };
    readonly baseCurrency?: BaseCurrency;
}

export interface ContributionApi {
    readonly amounts: number[];
    readonly currency: () => BaseCurrency;
}

export function installContributionApi(options: ContributionApiOptions = {}): ContributionApi {
    let currency: BaseCurrency = options.baseCurrency ?? 'BRL';
    const amounts: number[] = [];
    server.use(
        http.get('*/allocation/settings', () => HttpResponse.json(portfolioSettings({ baseCurrency: currency }))),
        http.put('*/allocation/settings', async ({ request }) => {
            const patch: Partial<PortfolioSettings> = (await request.json()) as Partial<PortfolioSettings>;
            currency = patch.baseCurrency ?? currency;
            return HttpResponse.json(portfolioSettings({ baseCurrency: currency }));
        }),
        http.post('*/portfolio/contributions/suggest', async ({ request }) => {
            const body: { amountMinor: number } = (await request.json()) as { amountMinor: number };
            amounts.push(body.amountMinor);
            if (options.failure !== undefined) {
                const { type, status } = options.failure;
                return HttpResponse.json({ type, title: 'x', status, detail: 'technical detail', requestId: null }, { status });
            }
            return HttpResponse.json({
                ...(options.suggestion ?? sampleSuggestion()),
                baseCurrency: currency,
                amountMinor: body.amountMinor
            });
        })
    );
    return { amounts, currency: (): BaseCurrency => currency };
}
