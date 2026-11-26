import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import type { AgendaWeek } from '../lib/agenda-weeks';
import type { AgendaItem } from '../types';
import { AgendaItemRow } from './agenda-item-row';

export function AgendaWeekSection({ week }: { readonly week: AgendaWeek }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    const locale: SupportedLocale = useLocale();
    const title: string = t('week', { date: formatIsoDate(week.start, locale) });
    return (
        <Card role="region" aria-label={title} className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-content-muted">{title}</h3>
            <ul className="flex flex-col divide-y divide-border">
                {week.items.map((item: AgendaItem): ReactElement => (
                    <AgendaItemRow key={`${item.kind}-${item.id}`} item={item} />
                ))}
            </ul>
        </Card>
    );
}
