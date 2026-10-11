import { http, HttpResponse } from 'msw';
import type {
    CategoryView,
    CreateCategoryBody,
    CreateRuleBody,
    RulePreviewInput,
    RuleView,
    UpdateCategoryBody
} from '@/features/spending/types';
import { categoryId, categoryView, defaultCategories, ruleView } from '../fixtures/spending';
import { server } from '../msw/server';

export interface RulesApi {
    rules: RuleView[];
    categories: CategoryView[];
    previews: RulePreviewInput[];
    createdRules: CreateRuleBody[];
    createdCategories: CreateCategoryBody[];
    categoryPatches: { id: string; body: UpdateCategoryBody }[];
    deletedCategories: { id: string; moveTo: string | null }[];
    deletedRules: string[];
    rulePatches: { id: string; body: object }[];
}

export const MARIA_RULE: RuleView = ruleView({
    id: 'rule-maria',
    matchType: 'counterparty',
    label: 'Maria Souza',
    appliesTo: 'out',
    categoryId: categoryId('shopping'),
    createdAt: '2026-10-08T12:00:00.000Z'
});

export const PADARIA_RULE: RuleView = ruleView({
    id: 'rule-padaria',
    matchType: 'contains',
    label: 'padaria estrela',
    appliesTo: 'out',
    categoryId: categoryId('groceries'),
    createdAt: '2026-10-01T12:00:00.000Z'
});

export function problemBody(type: string, status: number, meta?: Record<string, unknown>): object {
    return { type, title: 'x', status, detail: 'detail', requestId: null, ...(meta === undefined ? {} : { meta }) };
}

export function installRulesApi(overrides: Partial<Pick<RulesApi, 'rules' | 'categories'>> = {}): RulesApi {
    const api: RulesApi = {
        rules: overrides.rules ?? [MARIA_RULE, PADARIA_RULE],
        categories: overrides.categories ?? [...defaultCategories().categories, categoryView({ id: 'cat-pets', position: 17 })],
        previews: [],
        createdRules: [],
        createdCategories: [],
        categoryPatches: [],
        deletedCategories: [],
        deletedRules: [],
        rulePatches: []
    };
    server.use(
        http.get('*/spending/rules', () => HttpResponse.json({ rules: api.rules })),
        http.post('*/spending/rules/preview', async ({ request }) => {
            const body: RulePreviewInput = (await request.json()) as RulePreviewInput;
            api.previews.push(body);
            return HttpResponse.json({ normalizedPattern: body.pattern.toUpperCase(), matches: 1 });
        }),
        http.post('*/spending/rules', async ({ request }) => {
            const body: CreateRuleBody = (await request.json()) as CreateRuleBody;
            api.createdRules.push(body);
            const rule: RuleView = ruleView({
                id: 'rule-new',
                matchType: body.matchType,
                label: body.pattern,
                categoryId: body.categoryId
            });
            api.rules = [...api.rules, rule];
            return HttpResponse.json({ rule, recategorized: 3 }, { status: 201 });
        }),
        http.patch('*/spending/rules/:id', async ({ request, params }) => {
            const body: { categoryId?: string } = (await request.json()) as { categoryId?: string };
            api.rulePatches.push({ id: String(params['id']), body });
            const current: RuleView = api.rules.find((rule: RuleView): boolean => rule.id === params['id']) ?? ruleView();
            return HttpResponse.json({ rule: { ...current, ...body }, recategorized: 12 });
        }),
        http.delete('*/spending/rules/:id', ({ params }) => {
            api.deletedRules.push(String(params['id']));
            api.rules = api.rules.filter((rule: RuleView): boolean => rule.id !== params['id']);
            return HttpResponse.json({ recategorized: 4 });
        }),
        http.get('*/spending/categories', () => HttpResponse.json({ categories: api.categories })),
        http.post('*/spending/categories', async ({ request }) => {
            const body: CreateCategoryBody = (await request.json()) as CreateCategoryBody;
            api.createdCategories.push(body);
            const created: CategoryView = categoryView({
                id: 'cat-new',
                name: body.name,
                kind: body.kind,
                flexibility: body.flexibility ?? null,
                icon: body.icon
            });
            api.categories = [...api.categories, created];
            return HttpResponse.json(created, { status: 201 });
        }),
        http.patch('*/spending/categories/:id', async ({ request, params }) => {
            const body: UpdateCategoryBody = (await request.json()) as UpdateCategoryBody;
            api.categoryPatches.push({ id: String(params['id']), body });
            const current: CategoryView = api.categories.find((item: CategoryView): boolean => item.id === params['id']) ?? categoryView();
            const updated: CategoryView = { ...current, ...body };
            api.categories = api.categories.map((item: CategoryView): CategoryView => (item.id === updated.id ? updated : item));
            return HttpResponse.json(updated);
        }),
        http.delete('*/spending/categories/:id', ({ params, request }) => {
            api.deletedCategories.push({ id: String(params['id']), moveTo: new URL(request.url).searchParams.get('moveTo') });
            api.categories = api.categories.filter((item: CategoryView): boolean => item.id !== params['id']);
            return HttpResponse.json({ recategorized: 7 });
        })
    );
    return api;
}

export function stubViewport(wide: boolean): void {
    window.matchMedia = (query: string): MediaQueryList =>
        ({
            matches: wide,
            media: query,
            addEventListener: (): void => undefined,
            removeEventListener: (): void => undefined
        }) as unknown as MediaQueryList;
}

export function clearViewport(): void {
    Reflect.deleteProperty(window, 'matchMedia');
}
