import type { TransactionsSearch } from '../../schemas/spending-search.schema';
import type { TransactionsQuery } from '../../types';

export const TRANSACTIONS_PAGE_SIZE: number = 50;
export const MIN_SEARCH_LENGTH: number = 2;
export const MAX_SEARCH_LENGTH: number = 60;
export const SEARCH_DEBOUNCE_MS: number = 300;

export type FilterPatch = Partial<Record<keyof TransactionsSearch, TransactionsSearch[keyof TransactionsSearch] | undefined>>;

function cleaned(search: TransactionsSearch): TransactionsSearch {
    const text: string = search.q?.trim() ?? '';
    const entries: [string, unknown][] = Object.entries({ ...search, q: text === '' ? undefined : text }).filter(
        ([, value]: [string, unknown]): boolean => value !== undefined && value !== false
    );
    return Object.fromEntries(entries);
}

export function withFilter(search: TransactionsSearch, patch: FilterPatch): TransactionsSearch {
    const merged: TransactionsSearch = { ...search, ...patch, page: undefined } as TransactionsSearch;
    if (patch.uncategorized === true) {
        return cleaned({ ...merged, categoryId: undefined });
    }
    if (patch.categoryId !== undefined) {
        return cleaned({ ...merged, uncategorized: undefined });
    }
    return cleaned(merged);
}

export function withPage(search: TransactionsSearch, page: number): TransactionsSearch {
    return cleaned({ ...search, page: page > 1 ? page : undefined });
}

export function clearedFilters(search: TransactionsSearch): TransactionsSearch {
    return cleaned({ month: search.month });
}

export function hasActiveFilters(search: TransactionsSearch): boolean {
    return secondaryFilterCount(search) > 0 || (search.q?.trim() ?? '') !== '';
}

export function secondaryFilterCount(search: TransactionsSearch): number {
    const flags: boolean[] = [
        search.accountId !== undefined,
        search.categoryId !== undefined || search.uncategorized === true,
        search.direction !== undefined
    ];
    return flags.filter(Boolean).length;
}

function searchText(search: TransactionsSearch): string | undefined {
    const text: string = (search.q ?? '').trim().slice(0, MAX_SEARCH_LENGTH);
    return text.length >= MIN_SEARCH_LENGTH ? text : undefined;
}

export function filtersToQuery(search: TransactionsSearch): TransactionsQuery {
    const query: TransactionsQuery = {
        month: search.month,
        accountId: search.accountId,
        categoryId: search.uncategorized === true ? undefined : search.categoryId,
        uncategorized: search.uncategorized === true ? 'true' : undefined,
        direction: search.direction,
        q: searchText(search)
    };
    return Object.fromEntries(Object.entries(query).filter(([, value]: [string, unknown]): boolean => value !== undefined));
}

export function pageQuery(search: TransactionsSearch): TransactionsQuery {
    return { ...filtersToQuery(search), page: search.page ?? 1, pageSize: TRANSACTIONS_PAGE_SIZE };
}
