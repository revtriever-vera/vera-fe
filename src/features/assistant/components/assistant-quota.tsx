import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { periodMonthName, usedPercent } from '@/shared/lib/billing/billing-dates';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { AssistantUsage } from '../types';

export function AssistantQuota({ usage }: { readonly usage: AssistantUsage | null }): ReactElement | null {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const locale: SupportedLocale = useLocale();
    if (usage?.state !== 'warning') {
        return null;
    }
    const percent: number = usedPercent(usage.usedBps);
    const month: string = periodMonthName(usage.resetsAt, locale);
    return (
        <output className="m-0 block border-t border-caution/30 bg-caution/10 px-4 py-2 text-xs font-medium text-caution">
            {t('quota.warning', { percent, month })}
        </output>
    );
}
