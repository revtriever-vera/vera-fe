import type { ReactElement, ReactNode } from 'react';
import { Wallet } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import { formatShareBps } from '../../lib/format-bps';
import type { Overview } from '../../types';
import type { Callout } from '../lib/overview-view-model';
import { LargestDeviationCallout } from './largest-deviation-callout';

export interface TotalCardProps {
    readonly overview: Overview;
    readonly callout: Callout | null;
}

interface PillProps {
    readonly label: string;
    readonly value?: ReactNode;
    readonly title?: string;
}

function Pill({ label, value, title }: PillProps): ReactElement {
    return (
        <span title={title} className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs text-content-muted">
            {label}
            {value === undefined ? null : <b className="numeric font-semibold text-content">{value}</b>}
        </span>
    );
}

function UsdRatePill({ rate }: { readonly rate: NonNullable<Overview['usdRate']> }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    const formatted: string = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(Number(rate.brlPerUnit));
    const date: string = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', dateStyle: 'short' }).format(new Date(rate.date));
    return <Pill label={t('total.usdRate', { rate: formatted })} title={t('total.usdRateDate', { date })} />;
}

export function TotalCard({ overview, callout }: TotalCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    return (
        <section className="surface-card flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-sm font-medium text-content-muted">
                    <Wallet aria-hidden="true" className="size-4" />
                    {t('total.label')}
                </span>
                <Money
                    amountMinor={overview.totalMinor}
                    currency={overview.baseCurrency}
                    className="text-3xl font-extrabold tracking-tight"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                <Pill label={t('total.dollarExposure')} value={formatShareBps(overview.dollarExposure.shareBps, locale)} />
                <Pill
                    label={t('total.outside')}
                    value={t('total.outsideValue', { outside: overview.outsideCount, total: overview.classes.length })}
                />
                {overview.usdRate === null ? null : <UsdRatePill rate={overview.usdRate} />}
            </div>
            {callout === null ? null : <LargestDeviationCallout callout={callout} />}
        </section>
    );
}
