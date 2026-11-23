import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatGoalMonth } from '../lib/format-goal-date';
import { GOAL_BASE_CURRENCY, GOAL_STATUS, type GoalView } from '../types';

export function GoalSummaryLine({ goal }: { readonly goal: GoalView }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const money = (minor: number): string => formatCurrency(minor, GOAL_BASE_CURRENCY, locale);
    const date: string = formatGoalMonth(goal.targetDate, locale);
    if (goal.status === GOAL_STATUS.done) {
        return <p className="text-sm font-medium">{t('card.done')}</p>;
    }
    if (goal.status === GOAL_STATUS.overdue) {
        return <p className="text-sm font-medium">{t('card.overdue', { remaining: money(goal.remainingMinor), date })}</p>;
    }
    return (
        <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">
                {t('card.remaining', { remaining: money(goal.remainingMinor), monthly: money(goal.monthlyMinor), date })}
            </p>
            {goal.status === GOAL_STATUS.behind ? (
                <p className="text-xs text-content-muted">
                    {t('card.behindShift', { plan: money(goal.planMonthlyMinor), monthly: money(goal.monthlyMinor) })}
                </p>
            ) : null}
        </div>
    );
}
