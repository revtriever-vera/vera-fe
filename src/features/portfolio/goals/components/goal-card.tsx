import type { ReactElement } from 'react';
import { Flag, House, Plane, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { IconTile } from '@/shared/ui/icon-tile';
import { personName } from '../../lib/holder-filter';
import { usePeople, type PeopleState } from '../../lib/people-context';
import { progressPercent } from '../lib/goal-progress';
import { GOAL_BASE_CURRENCY, GOAL_KIND, type GoalKind, type GoalView } from '../types';
import { EditGoalLink } from './edit-goal-link';
import { GoalLinks, GoalMonthDelta } from './goal-card-details';
import { GoalProgressBar } from './goal-progress-bar';
import { GoalStatusBadge } from './goal-status-badge';
import { GoalSummaryLine } from './goal-summary-line';

const ICONS: Readonly<Record<GoalKind, LucideIcon>> = {
    [GOAL_KIND.emergencyReserve]: ShieldCheck,
    [GOAL_KIND.travel]: Plane,
    [GOAL_KIND.homeDownPayment]: House,
    [GOAL_KIND.other]: Flag
};

function HolderLine({ goal }: { readonly goal: GoalView }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const { people, multi }: PeopleState = usePeople();
    if (!multi) {
        return null;
    }
    const holder: string = goal.holderUserId === null ? t('card.holderAll') : personName(people, goal.holderUserId);
    return <p className="text-xs text-content-muted">{t('card.holder', { holder })}</p>;
}

export function GoalCard({ goal }: { readonly goal: GoalView }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const money = (minor: number): string => formatCurrency(minor, GOAL_BASE_CURRENCY, locale);
    return (
        <li className="surface-card flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <IconTile icon={ICONS[goal.kind]} tone="neutral" size="sm" />
                    <h3 className="min-w-0 truncate text-base font-semibold">{goal.name}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <GoalStatusBadge status={goal.status} />
                    <EditGoalLink goalId={goal.id} name={goal.name} />
                </div>
            </div>
            <GoalProgressBar
                label={t('card.progress', { name: goal.name })}
                percent={progressPercent(goal.balanceMinor, goal.targetMinor)}
                status={goal.status}
            />
            <p className="numeric text-sm text-content-muted">
                {t('card.saved', { balance: money(goal.balanceMinor), target: money(goal.targetMinor) })}
            </p>
            <GoalSummaryLine goal={goal} />
            <GoalMonthDelta goal={goal} />
            <GoalLinks goal={goal} />
            <HolderLine goal={goal} />
        </li>
    );
}
