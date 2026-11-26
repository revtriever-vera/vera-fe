import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Money } from '@/shared/ui/money';
import { formatUnitAmount } from '../lib/format-unit-amount';
import type { AgendaItem } from '../types';
import { AgendaItemLinks } from './agenda-item-links';

function useDateLines(item: AgendaItem): readonly string[] {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    const locale: SupportedLocale = useLocale();
    const lines: string[] = [];
    if (item.exDate !== null) {
        lines.push(t('item.exDate', { date: formatIsoDate(item.exDate, locale) }));
    }
    if (item.paymentDate !== null) {
        lines.push(t('item.paymentDate', { date: formatIsoDate(item.paymentDate, locale) }));
    }
    if (item.eventDate !== null) {
        lines.push(t(`item.eventDate.${item.kind}`, { date: formatIsoDate(item.eventDate, locale) }));
    }
    return lines;
}

function Amounts({ item }: { readonly item: AgendaItem }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex flex-col gap-0.5 sm:items-end">
            {item.amountPerUnit === null ? null : (
                <span className="text-sm text-content-muted">
                    {t('item.perUnit', { amount: formatUnitAmount(item.amountPerUnit, item.currency, locale) })}
                </span>
            )}
            {item.amountForAccountMinor === null ? null : (
                <span className="flex flex-col text-sm sm:items-end">
                    <span className="text-xs text-content-muted">{item.estimated ? t('item.forYouEstimated') : t('item.forYou')}</span>
                    <Money amountMinor={item.amountForAccountMinor} currency={item.currency} className="font-semibold" />
                </span>
            )}
        </div>
    );
}

export function AgendaItemRow({ item }: { readonly item: AgendaItem }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    const locale: SupportedLocale = useLocale();
    const lines: readonly string[] = useDateLines(item);
    return (
        <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <time dateTime={item.date} className="numeric text-sm font-semibold">
                        {formatIsoDate(item.date, locale)}
                    </time>
                    <span className="min-w-0 break-words text-sm font-semibold">{item.name}</span>
                    <Badge>{t(`kinds.${item.kind}`)}</Badge>
                </div>
                {lines.length === 0 ? null : <p className="text-xs text-content-muted">{lines.join(' · ')}</p>}
                <AgendaItemLinks item={item} />
            </div>
            <Amounts item={item} />
        </li>
    );
}
