import { http, HttpResponse, type RequestHandler } from 'msw';
import type { CategoryView, SpendingSettings, UpdateSpendingSettings } from '@/features/spending/types';
import {
    CURRENT_MONTH,
    accountView,
    categoryView,
    defaultCategories,
    emptyAccounts,
    emptyConnections,
    emptyCuts,
    emptyImports,
    emptySummary,
    importView,
    notConfiguredCredentials,
    ofxPreview,
    ruleView,
    spendingSettings,
    transactionView,
    validCredentials,
    emptyTransactions
} from '../../fixtures/spending';

function monthOf(request: Request): string {
    return new URL(request.url).searchParams.get('month') ?? CURRENT_MONTH;
}

function categoryHandlers(): RequestHandler[] {
    return [
        http.get('*/spending/categories', () => HttpResponse.json(defaultCategories())),
        http.post('*/spending/categories', async ({ request }) => {
            const body: Partial<CategoryView> = (await request.json()) as Partial<CategoryView>;
            return HttpResponse.json(categoryView(body), { status: 201 });
        }),
        http.patch('*/spending/categories/:id', async ({ params, request }) => {
            const body: Partial<CategoryView> = (await request.json()) as Partial<CategoryView>;
            const current: CategoryView | undefined = defaultCategories().categories.find(
                (item: CategoryView): boolean => item.id === params['id']
            );
            return HttpResponse.json({ ...(current ?? categoryView({ id: String(params['id']) })), ...body });
        }),
        http.delete('*/spending/categories/:id', () => HttpResponse.json({ recategorized: 0 }))
    ];
}

function ruleHandlers(): RequestHandler[] {
    return [
        http.get('*/spending/rules', () => HttpResponse.json({ rules: [] })),
        http.post('*/spending/rules/preview', async ({ request }) => {
            const body: { pattern: string } = (await request.json()) as { pattern: string };
            return HttpResponse.json({ normalizedPattern: body.pattern.toUpperCase(), matches: 0 });
        }),
        http.post('*/spending/rules', () => HttpResponse.json({ rule: ruleView(), recategorized: 0 }, { status: 201 })),
        http.patch('*/spending/rules/:id', () => HttpResponse.json({ rule: ruleView(), recategorized: 0 })),
        http.delete('*/spending/rules/:id', () => HttpResponse.json({ recategorized: 0 }))
    ];
}

function transactionHandlers(): RequestHandler[] {
    return [
        http.get('*/spending/transactions/uncategorized-count', () => HttpResponse.json({ count: 0 })),
        http.get('*/spending/transactions', () => HttpResponse.json(emptyTransactions())),
        http.patch('*/spending/transactions/:id', () =>
            HttpResponse.json({ transaction: transactionView(), rule: null, recategorized: 0 })
        ),
        http.get('*/spending/accounts', () => HttpResponse.json(emptyAccounts())),
        http.patch('*/spending/accounts/:id', async ({ request }) => {
            const body: { name: string } = (await request.json()) as { name: string };
            return HttpResponse.json(accountView({ name: body.name }));
        }),
        http.delete('*/spending/accounts/:id', () => new HttpResponse(null, { status: 204 }))
    ];
}

function summaryHandlers(): RequestHandler[] {
    return [
        http.get('*/spending/summary', ({ request }) => HttpResponse.json(emptySummary(monthOf(request)))),
        http.get('*/spending/cuts', ({ request }) => HttpResponse.json(emptyCuts(monthOf(request)))),
        http.get('*/spending/settings', () => HttpResponse.json(spendingSettings())),
        http.put('*/spending/settings', async ({ request }) => {
            const patch: UpdateSpendingSettings = (await request.json()) as UpdateSpendingSettings;
            const merged: SpendingSettings = spendingSettings(patch);
            return HttpResponse.json(merged);
        })
    ];
}

function connectionHandlers(): RequestHandler[] {
    return [
        http.get('*/spending/connections/credentials', () => HttpResponse.json(notConfiguredCredentials())),
        http.put('*/spending/connections/credentials', () => HttpResponse.json(validCredentials())),
        http.post('*/spending/connections/credentials/test', () => HttpResponse.json(validCredentials())),
        http.delete('*/spending/connections/credentials', () => new HttpResponse(null, { status: 204 })),
        http.post('*/spending/connections/sync', () => HttpResponse.json({ queued: 0 }, { status: 202 })),
        http.post('*/spending/connections/:id/sync', () => HttpResponse.json({ queued: true }, { status: 202 })),
        http.get('*/spending/connections', () => HttpResponse.json(emptyConnections())),
        http.post('*/spending/connections', () => HttpResponse.json({ results: [] })),
        http.delete('*/spending/connections/:id', () => new HttpResponse(null, { status: 204 }))
    ];
}

function importHandlers(): RequestHandler[] {
    return [
        http.post('*/spending/imports/preview', () => HttpResponse.json(ofxPreview())),
        http.get('*/spending/imports', () => HttpResponse.json(emptyImports())),
        http.post('*/spending/imports', () => HttpResponse.json({ ...importView(), rejections: [] }, { status: 201 })),
        http.delete('*/spending/imports/:id', () => HttpResponse.json({ removed: 0 }))
    ];
}

export function spendingHandlers(): RequestHandler[] {
    return [
        ...categoryHandlers(),
        ...ruleHandlers(),
        ...transactionHandlers(),
        ...summaryHandlers(),
        ...connectionHandlers(),
        ...importHandlers()
    ];
}
