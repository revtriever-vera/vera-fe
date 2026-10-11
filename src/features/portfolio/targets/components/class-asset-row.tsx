import type { ReactElement } from 'react';
import { CircleAlert } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { StatusChip } from '../../components/status-chip';
import { formatShareBps } from '../../lib/format-bps';
import type { BaseCurrency, ClassColorKey } from '../../types';
import type { AssetTargetsFormValues } from '../schemas/asset-targets.schema';
import type { ClassDetailAsset } from '../types';
import { AssetGaugeTooltip } from './asset-gauge-tooltip';
import { AssetTargetInput } from './asset-target-input';

export interface ClassAssetRowProps {
    readonly index: number;
    readonly asset: ClassDetailAsset;
    readonly currency: BaseCurrency;
    readonly colorKey: ClassColorKey;
    readonly control: Control<AssetTargetsFormValues>;
}

export const ROW_GRID: string = 'md:grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_7rem_11rem_7.5rem]';

function Identity({ asset }: { readonly asset: ClassDetailAsset }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <span className="col-span-2 min-w-0 md:col-span-1">
            <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold">{asset.symbol}</span>
                {asset.isZeroQuantity ? <Badge tone="accent">{t('classDetail.zeroQuantity')}</Badge> : null}
            </span>
            <span className="block truncate text-xs text-content-muted">{asset.name}</span>
        </span>
    );
}

function Situation({ asset }: { readonly asset: ClassDetailAsset }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    if (asset.missingQuote) {
        return (
            <Badge tone="caution">
                <CircleAlert className="size-3" aria-hidden="true" strokeWidth={2.5} />
                {t('classDetail.missingQuote')}
            </Badge>
        );
    }
    return <StatusChip status={asset.status} deviationBps={asset.deviationBps} />;
}

export function ClassAssetRow({ index, asset, currency, colorKey, control }: ClassAssetRowProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const quoted: boolean = !asset.missingQuote;
    return (
        <li className={`grid grid-cols-2 items-center gap-x-3 gap-y-2 py-3 md:gap-y-0 ${ROW_GRID}`}>
            <Identity asset={asset} />
            <span className="text-sm tabular-nums md:text-right">
                <span className="mr-1 text-xs text-content-muted md:sr-only">{t('classDetail.columns.value')}</span>
                {quoted ? formatCurrency(asset.valueMinor, currency, locale) : t('classDetail.noValue')}
            </span>
            <span className="text-right text-sm tabular-nums text-content-muted">
                <span className="mr-1 text-xs md:sr-only">{t('classDetail.columns.inClass')}</span>
                {quoted ? formatShareBps(asset.shareInClassBps, locale) : t('classDetail.noValue')}
            </span>
            <span className="col-span-2 md:col-span-1">
                <AssetGaugeTooltip asset={asset} currency={currency} colorKey={colorKey} />
            </span>
            <span className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:justify-end">
                <span className="text-xs text-content-muted md:sr-only">{t('classDetail.columns.target')}</span>
                <AssetTargetInput index={index} symbol={asset.symbol} control={control} />
            </span>
            <span className="col-span-2 md:col-span-1 md:justify-self-end">
                <Situation asset={asset} />
            </span>
        </li>
    );
}
