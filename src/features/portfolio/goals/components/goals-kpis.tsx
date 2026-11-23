import type { ReactElement } from 'react';
import { CalendarClock, CircleCheck, Clock } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { KpiTile } from '@/shared/ui/kpi';
import { GOAL_BASE_CURRENCY, type GoalsList } from '../types';

export function GoalsKpis({ totals }: { readonly totals: GoalsList['totals'] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <KpiTile
                label={t('kpis.monthly')}
                value={formatCurrency(totals.monthlyNeededMinor, GOAL_BASE_CURRENCY, locale)}
                support={t('kpis.monthlySupport')}
                icon={CalendarClock}
            />
            <KpiTile
                label={t('kpis.onTrack')}
                value={totals.onTrackCount}
                support={totals.doneCount > 0 ? t('kpis.doneSupport', { count: totals.doneCount }) : undefined}
                icon={CircleCheck}
                tone="positive"
            />
            <KpiTile
                label={t('kpis.behind')}
                value={totals.behindCount}
                icon={Clock}
                tone={totals.behindCount > 0 ? 'caution' : 'neutral'}
            />
        </div>
    );
}
