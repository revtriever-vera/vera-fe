import { http, HttpResponse } from 'msw';
import type { CutsResponse, SpendingSettings, UpdateSpendingSettings } from '@/features/spending/types';
import { canonicalCuts, emptyCuts, spendingSettings, type CutsCase } from '../fixtures/spending';
import { server } from '../msw/server';

const CASE_BY_BPS: Readonly<Record<number, CutsCase>> = {
    1000: 'goal10',
    2000: 'goal20',
    3500: 'goal35',
    6000: 'goal60'
};

export interface CutsApiOptions {
    readonly savedBps?: number;
    readonly override?: CutsResponse;
}

export interface CutsApi {
    readonly requests: URLSearchParams[];
    readonly puts: UpdateSpendingSettings[];
}

function responseFor(bps: number, simulated: boolean): CutsResponse {
    const base: CutsResponse = canonicalCuts(CASE_BY_BPS[bps] ?? 'goal20');
    return { ...base, goal: { ...base.goal, simulated } };
}

export function installCutsApi({ savedBps = 2000, override }: CutsApiOptions = {}): CutsApi {
    const api: CutsApi = { requests: [], puts: [] };
    let saved: number = savedBps;
    server.use(
        http.get('*/spending/cuts', ({ request }) => {
            const query: URLSearchParams = new URL(request.url).searchParams;
            api.requests.push(query);
            if (override !== undefined) {
                return HttpResponse.json(override);
            }
            const goal: string | null = query.get('goalBps');
            return HttpResponse.json(goal === null ? responseFor(saved, false) : responseFor(Number(goal), true));
        }),
        http.get('*/spending/settings', () => HttpResponse.json(spendingSettings({ savingsGoalBps: saved }))),
        http.put('*/spending/settings', async ({ request }) => {
            const patch: UpdateSpendingSettings = (await request.json()) as UpdateSpendingSettings;
            api.puts.push(patch);
            saved = patch.savingsGoalBps ?? saved;
            const merged: SpendingSettings = spendingSettings({ savingsGoalBps: saved });
            return HttpResponse.json(merged);
        })
    );
    return api;
}

export function noIncomeCuts(): CutsResponse {
    return emptyCuts('2026-09', { status: 'no_income', goal: { bps: 2000, minor: 0, simulated: false } });
}
