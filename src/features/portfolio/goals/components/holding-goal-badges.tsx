import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { useGoals } from '../api/use-goals.query';
import { holdingGoalLinks, type HoldingGoalLink } from '../lib/holding-goal-links';
import type { GoalHoldingView, GoalsList } from '../types';

const BPS_PER_UNIT: number = 10000;

export interface HoldingGoalBadgesProps {
    readonly kind: GoalHoldingView['kind'];
    readonly holdingId: string;
}

export function HoldingGoalBadges({ kind, holdingId }: HoldingGoalBadgesProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const goals: UseQueryResult<GoalsList> = useGoals();
    const links: readonly HoldingGoalLink[] = goals.data === undefined ? [] : holdingGoalLinks(goals.data.items, kind, holdingId);
    if (links.length === 0) {
        return null;
    }
    const percent = (bps: number): string =>
        new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(bps / BPS_PER_UNIT);
    return (
        <ul aria-label={t('holdingBadge.label')} className="mt-1 flex flex-wrap gap-1">
            {links.map((link: HoldingGoalLink): ReactElement => (
                <li key={link.goalId} className="min-w-0">
                    <Badge tone="accent" className="max-w-full">
                        <span className="truncate">{t('holdingBadge.item', { name: link.name, percent: percent(link.shareBps) })}</span>
                    </Badge>
                </li>
            ))}
        </ul>
    );
}
