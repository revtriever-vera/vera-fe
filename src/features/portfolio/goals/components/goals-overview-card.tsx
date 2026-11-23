import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { ChevronRight, Flag } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { IconTile } from '@/shared/ui/icon-tile';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import { useGoals } from '../api/use-goals.query';
import { GOAL_BASE_CURRENCY, type GoalsList } from '../types';

function summaryLine(totals: GoalsList['totals'], t: UseTranslationResponse<'portfolioGoals', undefined>['t'], amount: string): string {
    if (totals.behindCount > 0) {
        return t('overviewCard.behind', { count: totals.behindCount, amount });
    }
    if (totals.monthlyNeededMinor > 0) {
        return t('overviewCard.onTrack', { amount });
    }
    return t('overviewCard.done');
}

export function GoalsOverviewCard(): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const holder: HolderParam = useHolderParam();
    const goals: UseQueryResult<GoalsList> = useGoals(holder);
    if (goals.data === undefined || goals.data.totals.count === 0) {
        return null;
    }
    const totals: GoalsList['totals'] = goals.data.totals;
    const amount: string = formatCurrency(totals.monthlyNeededMinor, GOAL_BASE_CURRENCY, locale);
    return (
        <Link
            to="/portfolio/goals"
            search={holder === undefined ? {} : { holder }}
            className="surface-card flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-muted"
        >
            <span className="flex min-w-0 items-center gap-3">
                <IconTile icon={Flag} tone="neutral" size="sm" />
                <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold">{t('overviewCard.title')}</span>
                    <span className="numeric truncate text-sm text-content-muted">{summaryLine(totals, t, amount)}</span>
                </span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-content-subtle" />
        </Link>
    );
}
