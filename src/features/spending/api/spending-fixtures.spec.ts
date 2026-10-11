import { describe, expect, it } from 'vitest';
import {
    CANONICAL_INCOME_MINOR,
    CANONICAL_SAVED_MINOR,
    canonicalAccounts,
    canonicalConnections,
    canonicalCuts,
    canonicalSummary,
    canonicalTransactions,
    defaultCategories,
    emptySummary,
    ofxPreview,
    type CutsCase
} from '../../../../test/fixtures/spending';
import type {
    CategoryView,
    CutSuggestion,
    CutsResponse,
    MonthlySummary,
    SummaryCategoryRow,
    TransactionView,
    TransactionsResponse
} from '../types';

const CASES: readonly CutsCase[] = ['goal20', 'goal35', 'goal60', 'goal10', 'pixLeisure'];

function sum(values: readonly number[]): number {
    return values.reduce((total: number, value: number): number => total + value, 0);
}

describe('fixtures dos gastos', () => {
    it('as categorias padrão são 17, com 12 de gasto, 2 de entrada e 3 de transferência', () => {
        const categories: CategoryView[] = defaultCategories().categories;

        expect(categories).toHaveLength(17);
        expect(categories.filter((category): boolean => category.kind === 'expense')).toHaveLength(12);
        expect(categories.filter((category): boolean => category.kind === 'income')).toHaveLength(2);
        expect(categories.filter((category): boolean => category.kind === 'transfer')).toHaveLength(3);
    });

    it('o resumo de M−1 fecha com os números do conjunto canônico', () => {
        const summary: MonthlySummary = canonicalSummary();
        const categorized: number = sum(summary.categories.map((row: SummaryCategoryRow): number => row.spentMinor));

        expect(categorized).toBe(2384000);
        expect(categorized + summary.uncategorizedMinor).toBe(summary.expensesMinor);
        expect(summary.income.minor - summary.expensesMinor).toBe(summary.savedMinor);
        expect(summary.savedMinor).toBe(CANONICAL_SAVED_MINOR);
        expect(summary.goal.minor - summary.savedMinor).toBe(summary.gapMinor);
        expect(summary.fixedMinor + summary.flexibleMinor).toBe(categorized);
        expect(summary.categories.find((row: SummaryCategoryRow): boolean => row.systemKey === 'leisure')?.deltaBps).toBe(3571);
        expect(summary.categories.find((row: SummaryCategoryRow): boolean => row.systemKey === 'shopping')?.deltaBps).toBe(4688);
    });

    it('a página de transações de M−1 bate com o resumo', () => {
        const page: TransactionsResponse = canonicalTransactions();
        const uncategorized: TransactionView[] = page.data.filter((item: TransactionView): boolean => item.categoryId === null);

        expect(page.totals.count).toBe(page.data.length);
        expect(uncategorized).toHaveLength(2);
        expect(sum(uncategorized.map((item: TransactionView): number => -item.amountMinor))).toBe(80000);
        expect(page.data.filter((item: TransactionView): boolean => item.description === 'SALARIO EMPRESA X')[0]?.amountMinor).toBe(
            CANONICAL_INCOME_MINOR
        );
        expect((page.data[0]?.date ?? '') >= (page.data[1]?.date ?? '')).toBe(true);
    });

    it('as contas contam as transações da página', () => {
        const counted: number = sum(canonicalAccounts().accounts.map((account): number => account.transactionCount));

        expect(counted).toBe(canonicalTransactions().data.length);
    });

    it.each(CASES)('os cortes de %s somam o corte total e respeitam o gasto', (kind: CutsCase) => {
        const cuts: CutsResponse = canonicalCuts(kind);

        expect(sum(cuts.suggestions.map((item: CutSuggestion): number => item.cutMinor))).toBe(cuts.totalCutMinor);
        for (const item of cuts.suggestions) {
            expect(item.cutMinor).toBeGreaterThanOrEqual(0);
            expect(item.cutMinor).toBeLessThanOrEqual(item.spentMinor);
            expect(item.limitMinor).toBe(item.spentMinor - item.cutMinor);
        }
    });

    it('as metas e os status dos cinco casos', () => {
        expect(canonicalCuts('goal20').status).toBe('cut_suggested');
        expect(canonicalCuts('goal35').gapMinor).toBe(644000);
        expect(canonicalCuts('goal60').status).toBe('exceeds_flexible');
        expect(canonicalCuts('goal60').totalCutMinor).toBe(1154000);
        expect(canonicalCuts('goal10').surplusMinor).toBe(56000);
        expect(canonicalCuts('pixLeisure').uncategorizedMinor).toBe(0);
    });

    it('as duas conexões mock têm estados diferentes', () => {
        expect(canonicalConnections().connections.map((item): string => item.status)).toEqual(['active', 'needs_attention']);
    });

    it('a prévia de OFX e o resumo vazio são coerentes', () => {
        expect(ofxPreview().sample).toHaveLength(ofxPreview().rows);
        expect(emptySummary('2026-10').hasData).toBe(false);
        expect(emptySummary('2026-10').isPartial).toBe(true);
    });
});
