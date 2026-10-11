import type { ReactElement, ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { RichBalloon } from '@/shared/ui/tooltip';
import { Gauge } from '../../components/gauge';
import { formatShareBps, formatTargetBps } from '../../lib/format-bps';
import type { BaseCurrency, ClassColorKey } from '../../types';
import type { ClassDetailAsset } from '../types';

export interface AssetGaugeTooltipProps {
    readonly asset: ClassDetailAsset;
    readonly currency: BaseCurrency;
    readonly colorKey: ClassColorKey;
}

function SituationLine({ asset, currency }: { readonly asset: ClassDetailAsset; readonly currency: BaseCurrency }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const amount: string = formatCurrency(Math.abs(asset.gapMinor), currency, locale);
    if (asset.missingQuote) {
        return <span>{t('classDetail.tooltip.unavailable')}</span>;
    }
    if (asset.status === 'within') {
        return <span>{t('classDetail.tooltip.within')}</span>;
    }
    return <span>{asset.gapMinor > 0 ? t('classDetail.tooltip.missing', { amount }) : t('classDetail.tooltip.excess', { amount })}</span>;
}

function TooltipContent({ asset, currency }: { readonly asset: ClassDetailAsset; readonly currency: BaseCurrency }): ReactNode {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    return (
        <span className="flex flex-col gap-0.5">
            <span>
                {t('classDetail.tooltip.current', {
                    share: formatShareBps(asset.shareInClassBps, locale),
                    value: formatCurrency(asset.valueMinor, currency, locale)
                })}
            </span>
            <span>{t('classDetail.tooltip.target', { target: formatTargetBps(asset.targetInClassBps, locale) })}</span>
            <SituationLine asset={asset} currency={currency} />
        </span>
    );
}

export function AssetGaugeTooltip({ asset, currency, colorKey }: AssetGaugeTooltipProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <RichBalloon content={<TooltipContent asset={asset} currency={currency} />}>
            <button
                type="button"
                aria-label={t('classDetail.gaugeLabel', { symbol: asset.symbol })}
                className="block w-full rounded-control py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
                <Gauge shareBps={asset.shareInClassBps} targetBps={asset.targetInClassBps} colorKey={colorKey} />
            </button>
        </RichBalloon>
    );
}
