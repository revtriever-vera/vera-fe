import { useSearch } from '@tanstack/react-router';
import { reviewMonthSchema } from '../schemas/review-month.schema';
import type { MonthlyReviewList } from '../types';

export function useMonthParam(): string | undefined {
    return useSearch({
        strict: false,
        select: (search: Record<string, unknown>): string | undefined => reviewMonthSchema.parse(search.month)
    });
}

export function selectedMonth(items: MonthlyReviewList['items'], requested: string | undefined): string | undefined {
    return requested ?? items[0]?.month;
}
