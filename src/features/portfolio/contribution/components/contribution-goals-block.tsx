import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Money } from '@/shared/ui/money';
import type { ContributionGoal } from '../types';

export interface ContributionGoalsBlockProps {
    readonly goals: readonly ContributionGoal[];
    readonly totalMinor: number;
    readonly currency: string;
}

function GoalRow({ goal, currency }: { readonly goal: ContributionGoal; readonly currency: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const { destination } = goal;
    return (
        <li className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-content">{goal.name}</span>
                <span className="truncate text-xs text-content-muted">
                    {t('goals.destination', { symbol: destination.symbol, name: destination.name })}
                </span>
                {destination.hint === 'new_or_reinforce' ? (
                    <span className="text-xs text-content-muted">{t('units.fixedIncome')}</span>
                ) : null}
            </div>
            <Money amountMinor={goal.amountMinor} currency={currency} className="shrink-0 text-sm font-semibold" />
        </li>
    );
}

export function ContributionGoalsBlock({ goals, totalMinor, currency }: ContributionGoalsBlockProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    if (goals.length === 0) {
        return null;
    }
    return (
        <section aria-labelledby="contribution-goals-title" className="surface-card flex min-w-0 flex-col p-4">
            <div className="flex items-center justify-between gap-3">
                <h3 id="contribution-goals-title" className="text-base font-bold text-content">
                    {t('goals.title')}
                </h3>
                <Money amountMinor={totalMinor} currency={currency} className="text-lg font-extrabold text-content" />
            </div>
            <ul aria-label={t('goals.listLabel')} className="mt-2 divide-y divide-border border-t border-border">
                {goals.map((goal: ContributionGoal): ReactElement => (
                    <GoalRow key={goal.goalId} goal={goal} currency={currency} />
                ))}
            </ul>
        </section>
    );
}
