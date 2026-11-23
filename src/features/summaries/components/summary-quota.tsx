import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDayMonth, periodMonthName, usedPercent } from '@/shared/lib/billing/billing-dates';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import type { SummaryView } from '../types';

export function SummaryQuota({ usage }: { readonly usage: SummaryView['usage'] }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const date: string = formatDayMonth(usage.resetsAt, locale);
    if (usage.state === 'paused') {
        return <Alert tone="critical" title={t('banner.pausedTitle', { date })} detail={t('banner.paused')} />;
    }
    if (usage.state === 'warning') {
        const percent: number = usedPercent(usage.usedBps);
        const month: string = periodMonthName(usage.resetsAt, locale);
        return <Alert tone="caution" title={t('banner.warningTitle', { percent, month })} detail={t('banner.warning', { date })} />;
    }
    return null;
}
