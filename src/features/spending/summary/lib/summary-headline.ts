import type { MonthlySummary } from '../../types';

export type Headline = 'saved' | 'overspent' | 'no_income';

export function headlineOf(summary: Pick<MonthlySummary, 'income' | 'savedMinor'>): Headline {
    if (summary.income.minor <= 0) {
        return 'no_income';
    }
    return summary.savedMinor < 0 ? 'overspent' : 'saved';
}
