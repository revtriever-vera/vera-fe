import type { AgendaFilter, AgendaItem, AgendaKind } from '../types';

const FILTER_OF_KIND: Readonly<Record<AgendaKind, AgendaFilter>> = {
    dividend: 'income',
    jcp: 'income',
    fii_income: 'income',
    amortization: 'income',
    assembly: 'assembly',
    earnings_release: 'assembly',
    fixed_income_maturity: 'maturity',
    treasury_maturity: 'maturity'
};

export function filterOfKind(kind: AgendaKind): AgendaFilter {
    return FILTER_OF_KIND[kind];
}

export function applyAgendaFilter(items: readonly AgendaItem[], filter: AgendaFilter | undefined): readonly AgendaItem[] {
    if (filter === undefined) {
        return items;
    }
    return items.filter((item: AgendaItem): boolean => filterOfKind(item.kind) === filter);
}

export function isMaturity(kind: AgendaKind): boolean {
    return filterOfKind(kind) === 'maturity';
}
