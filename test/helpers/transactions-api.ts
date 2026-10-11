import { http, HttpResponse } from 'msw';
import type { AccountsResponse, RecategorizeBody, RuleView, TransactionView, TransactionsResponse } from '@/features/spending/types';
import { canonicalAccounts, canonicalTransactions, ruleView } from '../fixtures/spending';
import { server } from '../msw/server';
import { problem } from './assets-api';

export interface TransactionsApiOptions {
    readonly transactions?: TransactionsResponse;
    readonly accounts?: AccountsResponse;
    readonly patchFailures?: readonly { readonly type: string; readonly status: number }[];
    readonly exportFailure?: { readonly type: string; readonly status: number };
    readonly listFailureStatus?: number;
}

export interface TransactionsApi {
    readonly lists: URLSearchParams[];
    readonly patches: { id: string; body: RecategorizeBody }[];
    readonly exports: URLSearchParams[];
    readonly state: TransactionView[];
}

const PAGE_SIZE_DEFAULT: number = 50;

type Predicate = (item: TransactionView, query: URLSearchParams) => boolean;

const PREDICATES: readonly Predicate[] = [
    (item, query): boolean => query.get('accountId') === null || item.accountId === query.get('accountId'),
    (item, query): boolean => query.get('categoryId') === null || item.categoryId === query.get('categoryId'),
    (item, query): boolean => query.get('uncategorized') !== 'true' || item.categoryId === null,
    (item, query): boolean => query.get('direction') !== 'in' || item.amountMinor > 0,
    (item, query): boolean => query.get('direction') !== 'out' || item.amountMinor < 0,
    (item, query): boolean =>
        `${item.description} ${item.counterpartyName ?? ''}`.toLowerCase().includes((query.get('q') ?? '').toLowerCase())
];

function matches(item: TransactionView, query: URLSearchParams): boolean {
    return PREDICATES.every((predicate: Predicate): boolean => predicate(item, query));
}

function pageOf(items: readonly TransactionView[], query: URLSearchParams): TransactionsResponse {
    const pageSize: number = Number(query.get('pageSize') ?? PAGE_SIZE_DEFAULT);
    const page: number = Number(query.get('page') ?? 1);
    const sum = (filter: (item: TransactionView) => boolean): number =>
        items.filter(filter).reduce((total: number, item: TransactionView): number => total + item.amountMinor, 0);
    return {
        data: items.slice((page - 1) * pageSize, page * pageSize),
        pagination: { page, pageSize, totalRecords: items.length, totalPages: Math.ceil(items.length / pageSize) },
        totals: {
            inMinor: sum((item: TransactionView): boolean => item.amountMinor > 0),
            outMinor: sum((item: TransactionView): boolean => item.amountMinor < 0),
            count: items.length
        }
    };
}

function sameTarget(item: TransactionView, target: TransactionView, rule: NonNullable<RecategorizeBody['rule']>): boolean {
    return rule.scope === 'counterparty' ? item.counterpartyName === target.counterpartyName : item.description === target.description;
}

function applyPatch(state: TransactionView[], id: string, body: RecategorizeBody): { transaction: TransactionView; recategorized: number } {
    const target: TransactionView | undefined = state.find((item: TransactionView): boolean => item.id === id);
    if (target === undefined) {
        throw new Error(`transação ${id} fora do mock`);
    }
    target.categoryId = body.categoryId;
    target.categorySource = body.categoryId === null ? 'dictionary' : 'user';
    const rule: RecategorizeBody['rule'] = body.rule;
    const others: TransactionView[] =
        rule === null || rule === undefined
            ? []
            : state.filter(
                  (item: TransactionView): boolean => item.id !== id && item.categoryId === null && sameTarget(item, target, rule)
              );
    for (const item of others) {
        item.categoryId = body.categoryId;
        item.categorySource = 'rule';
    }
    return { transaction: target, recategorized: others.length };
}

export function mockTransactionsApi(options: TransactionsApiOptions = {}): TransactionsApi {
    const source: TransactionsResponse = options.transactions ?? canonicalTransactions();
    const api: TransactionsApi = {
        lists: [],
        patches: [],
        exports: [],
        state: source.data.map((item: TransactionView): TransactionView => ({ ...item }))
    };
    const failures: { type: string; status: number }[] = [...(options.patchFailures ?? [])];
    server.use(
        http.get('*/spending/transactions/uncategorized-count', () =>
            HttpResponse.json({ count: api.state.filter((item: TransactionView): boolean => item.categoryId === null).length })
        ),
        http.get('*/spending/transactions/export', ({ request }) => {
            const query: URLSearchParams = new URL(request.url).searchParams;
            api.exports.push(query);
            if (options.exportFailure !== undefined) {
                return problem(options.exportFailure.type, options.exportFailure.status);
            }
            return new HttpResponse('data', {
                headers: {
                    'content-type': 'application/octet-stream',
                    'content-disposition': `attachment; filename="vera-transacoes-2026-10-11.${query.get('format') ?? 'csv'}"`
                }
            });
        }),
        http.get('*/spending/transactions', ({ request }) => {
            const query: URLSearchParams = new URL(request.url).searchParams;
            api.lists.push(query);
            if (options.listFailureStatus !== undefined) {
                return problem('core.internal', options.listFailureStatus);
            }
            return HttpResponse.json(
                pageOf(
                    api.state.filter((item: TransactionView): boolean => matches(item, query)),
                    query
                )
            );
        }),
        http.patch('*/spending/transactions/:id', async ({ request, params }) => {
            const body: RecategorizeBody = (await request.json()) as RecategorizeBody;
            api.patches.push({ id: String(params['id']), body });
            const failure: { type: string; status: number } | undefined = failures.shift();
            if (failure !== undefined) {
                return problem(failure.type, failure.status);
            }
            const result: { transaction: TransactionView; recategorized: number } = applyPatch(api.state, String(params['id']), body);
            const rule: RuleView | null = body.rule === null || body.rule === undefined ? null : ruleView({ matchType: body.rule.scope });
            return HttpResponse.json({ ...result, rule });
        }),
        http.get('*/spending/accounts', () => HttpResponse.json(options.accounts ?? canonicalAccounts()))
    );
    return api;
}
