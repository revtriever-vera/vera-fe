import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatShareBps } from '../../lib/format-bps';
import { signedDelta } from '../lib/goal-progress';
import { GOAL_BASE_CURRENCY, type GoalHoldingView, type GoalView } from '../types';

export function GoalMonthDelta({ goal }: { readonly goal: GoalView }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const delta: ReturnType<typeof signedDelta> = goal.monthDeltaMinor === null ? null : signedDelta(goal.monthDeltaMinor);
    if (delta === null) {
        return null;
    }
    const amount: string = formatCurrency(delta.absMinor, GOAL_BASE_CURRENCY, locale);
    return <p className="text-xs text-content-subtle">{t(delta.sign === 'gain' ? 'card.monthGain' : 'card.monthLoss', { amount })}</p>;
}

export function GoalLinks({ goal }: { readonly goal: GoalView }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const linked: readonly GoalHoldingView[] = goal.holdings.filter((holding: GoalHoldingView): boolean => !holding.removed);
    const manual: string = formatCurrency(goal.manualMinor, GOAL_BASE_CURRENCY, locale);
    return (
        <div className="flex flex-col gap-1 text-xs text-content-muted">
            {linked.length === 0 ? null : (
                <ul aria-label={t('card.holdingsLabel', { name: goal.name })} className="flex flex-wrap gap-x-3 gap-y-1">
                    {linked.map((holding: GoalHoldingView): ReactElement => (
                        <li key={`${holding.kind}:${holding.holdingId}`}>
                            {t('card.holdingShare', {
                                name: holding.name ?? holding.symbol ?? '',
                                share: formatShareBps(holding.shareBps, locale, 0)
                            })}
                        </li>
                    ))}
                </ul>
            )}
            {goal.manualMinor > 0 ? <p>{t('card.manual', { amount: manual })}</p> : null}
            {goal.removedHoldings > 0 ? <p>{t('card.removed', { count: goal.removedHoldings })}</p> : null}
        </div>
    );
}
