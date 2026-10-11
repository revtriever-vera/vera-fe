import { X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Money } from '@/shared/ui/money';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView, BaseCurrency, ClassColorKey, HoldingView } from '../../types';
import { formatQuantity } from '../lib/format-quantity';
import { unitLabelKey, type UnitLabelKey } from '../lib/unit-label';
import { hasValue } from '../lib/wallet-totals';

export interface WalletItemProps {
    readonly holding: HoldingView;
    readonly assetClass: AssetClassView | undefined;
    readonly baseCurrency: BaseCurrency;
    readonly onRemove: (holding: HoldingView) => void;
}

const FALLBACK_COLOR: ClassColorKey = 'c1';

function useDetail(holding: HoldingView, assetClass: AssetClassView | undefined): string {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const label: ClassLabel = useClassLabel();
    const locale: SupportedLocale = useLocale();
    const className: string =
        assetClass === undefined ? t(`types.${holding.typeGroup}.name`) : label(assetClass.systemKey, assetClass.name);
    if (holding.quantity === null) {
        return className;
    }
    const unit: UnitLabelKey | null = unitLabelKey(holding.typeGroup);
    const quantity: string = formatQuantity(holding.quantity, holding.quantityDecimals, locale);
    return `${className} · ${unit === null ? quantity : `${quantity} ${t(`wallet.units.${unit}`)}`}`;
}

function QualityBadge({ holding }: { readonly holding: HoldingView }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    if (holding.missingQuote) {
        return <Badge tone="caution">{t('wallet.noQuote')}</Badge>;
    }
    return holding.missingRate ? <Badge tone="caution">{t('wallet.noRate')}</Badge> : null;
}

export function WalletItem({ holding, assetClass, baseCurrency, onRemove }: WalletItemProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const detail: string = useDetail(holding, assetClass);
    return (
        <li className="flex items-center gap-2.5 rounded-control bg-surface p-2">
            <ClassTile
                systemKey={assetClass?.systemKey ?? null}
                colorKey={assetClass === undefined ? FALLBACK_COLOR : toClassColorKey(assetClass.colorKey)}
                size="sm"
            />
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-content">{holding.symbol}</span>
                <span className="text-xs text-content-muted">{detail}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5 text-sm font-semibold text-content">
                {hasValue(holding) ? (
                    <Money amountMinor={holding.valueMinor} currency={baseCurrency} />
                ) : (
                    <span>{t('position.valueEmpty')}</span>
                )}
                <QualityBadge holding={holding} />
            </span>
            <button
                type="button"
                aria-label={t('wallet.remove', { symbol: holding.symbol })}
                onClick={(): void => {
                    onRemove(holding);
                }}
                className="grid size-8 shrink-0 place-items-center rounded-control text-content-muted transition-colors hover:bg-critical/10 hover:text-critical focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
            >
                <X className="size-4" aria-hidden="true" />
            </button>
        </li>
    );
}
