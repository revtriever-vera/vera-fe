import { http, HttpResponse } from 'msw';
import type { AssetClassView, ClassesResponse, Overview, PortfolioSettings, SaveClassTargetsBody } from '@/features/portfolio/types';
import { defaultClasses, emptyOverview, portfolioSettings, sampleOverview } from '../fixtures/portfolio';
import { server } from '../msw/server';
import { problem, type RecordedRequest } from './classes-api';

export interface TargetsApiOptions {
    readonly classes?: ClassesResponse;
    readonly overview?: Overview;
    readonly settings?: PortfolioSettings;
    readonly saveFailure?: { readonly type: string; readonly status: number; readonly meta?: Record<string, unknown> };
}

export interface TargetsApi {
    readonly requests: RecordedRequest[];
    readonly current: () => readonly AssetClassView[];
}

export function emptyPortfolioOverview(): Overview {
    return emptyOverview({ empty: true, classes: [] });
}

export function installTargetsApi(options: TargetsApiOptions = {}): TargetsApi {
    let classes: AssetClassView[] = [...(options.classes ?? defaultClasses()).data];
    const defaults: readonly AssetClassView[] = defaultClasses().data;
    const requests: RecordedRequest[] = [];
    const record = (request: Request, body: unknown): void => {
        requests.push({ method: request.method, path: new URL(request.url).pathname, body });
    };
    server.use(
        http.get('*/allocation/classes', () => HttpResponse.json({ data: classes })),
        http.get('*/portfolio/overview', () => HttpResponse.json(options.overview ?? sampleOverview())),
        http.get('*/allocation/settings', () => HttpResponse.json(options.settings ?? portfolioSettings())),
        http.put('*/allocation/targets/classes', async ({ request }) => {
            const body: SaveClassTargetsBody = (await request.json()) as SaveClassTargetsBody;
            record(request, body);
            if (options.saveFailure !== undefined) {
                const { type, status, meta } = options.saveFailure;
                return HttpResponse.json({ type, title: 'x', status, detail: 'technical detail', requestId: null, meta }, { status });
            }
            classes = classes.map((item: AssetClassView): AssetClassView => ({
                ...item,
                targetBps:
                    body.targets.find((entry: { classId: string }): boolean => entry.classId === item.id)?.targetBps ?? item.targetBps
            }));
            return HttpResponse.json({ data: classes });
        }),
        http.post('*/allocation/targets/reset', ({ request }) => {
            record(request, null);
            classes = classes.map((item: AssetClassView): AssetClassView => ({
                ...item,
                targetBps: defaults.find((entry: AssetClassView): boolean => entry.id === item.id)?.targetBps ?? 0
            }));
            return HttpResponse.json({ data: classes });
        }),
        http.put('*/allocation/settings', async ({ request }) => {
            const body: unknown = await request.json();
            record(request, body);
            if (options.settings === undefined && (body as { toleranceBps?: number }).toleranceBps === 999) {
                return problem('validation_failed', 400);
            }
            return HttpResponse.json(portfolioSettings(body as Partial<PortfolioSettings>));
        })
    );
    return { requests, current: (): readonly AssetClassView[] => classes };
}
