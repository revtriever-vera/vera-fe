import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { cn } from '@/shared/lib/cn';
import { Money } from '@/shared/ui/money';
import { formatShareBps } from '../../lib/format-bps';
import { formatSignedPercentBps, signSymbol } from '../lib/signed-percent';
import { useKindLabel } from '../lib/use-kind-label';
import type { RealRateItem } from '../types';

export function RealRateTitleCell({ item }: { readonly item: RealRateItem }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    const kindLabel: (kind: string) => string = useKindLabel();
    return (
        <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{item.name}</span>
            <span className="text-xs text-content-muted">
                {t('realRate.subtitle', { kind: kindLabel(item.kind), date: formatIsoDate(item.appliedAt, locale) })}
            </span>
        </span>
    );
}

export function PercentCell({ bps }: { readonly bps: number | null }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    return <span className="numeric">{bps === null ? t('common.none') : formatShareBps(bps, locale, 2)}</span>;
}

export function RealRateCell({ item }: { readonly item: RealRateItem }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    if (item.realAnnualBps === null) {
        return <span className="numeric">{t('common.none')}</span>;
    }
    return (
        <span className="flex flex-col items-end">
            <b className={cn('numeric', item.lowReal ? 'text-caution' : 'text-positive')}>
                <PercentCell bps={item.realAnnualBps} />
            </b>
            <span className="text-xs text-content-muted">{item.lowReal ? t('realRate.low') : t('realRate.ok')}</span>
        </span>
    );
}

export function GainCell({ item }: { readonly item: RealRateItem }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    return (
        <span className="flex flex-col items-end">
            <span>
                {signSymbol(item.purchasingPowerGainMinor)}
                <Money amountMinor={Math.abs(item.purchasingPowerGainMinor)} currency="BRL" />
            </span>
            <span className="text-xs text-content-muted">
                {t('realRate.purchasingPower', { change: formatSignedPercentBps(item.purchasingPowerGainBps, locale) })}
            </span>
        </span>
    );
}
