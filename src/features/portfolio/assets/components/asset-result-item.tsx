import { Info } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { ClassTile } from '../../components/class-tile';
import type { ClassColorKey } from '../../types';
import { exposureKind, type ExposureKind } from '../lib/exposure-note';
import type { CatalogAsset } from '../types';

export type ResultPrice =
    { readonly state: 'ready'; readonly text: string } | { readonly state: 'pending' } | { readonly state: 'unavailable' };

export interface AssetResultItemProps {
    readonly asset: CatalogAsset;
    readonly colorKey: ClassColorKey;
    readonly price: ResultPrice;
    readonly selected: boolean;
    readonly held: boolean;
    readonly tabIndex: number;
    readonly onPick: (asset: CatalogAsset) => void;
}

function PriceText({ price }: { readonly price: ResultPrice }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    if (price.state === 'ready') {
        return <span className="numeric">{price.text}</span>;
    }
    return <span>{price.state === 'pending' ? t('result.pricePending') : t('result.priceUnavailable')}</span>;
}

function ExposureLine({ kind }: { readonly kind: ExposureKind }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <span className="mt-0.5 flex items-start gap-1 text-2xs text-caution">
            <Info className="mt-px size-3 shrink-0" aria-hidden="true" />
            {t(`exposure.${kind}`)}
        </span>
    );
}

export function AssetResultItem({ asset, colorKey, price, selected, held, tabIndex, onPick }: AssetResultItemProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const exposure: ExposureKind | null = exposureKind(asset);
    return (
        <button
            type="button"
            role="option"
            aria-selected={selected}
            tabIndex={tabIndex}
            onClick={(): void => {
                onPick(asset);
            }}
            className={cn(
                'flex w-full items-start gap-3 rounded-control border p-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none',
                selected ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-surface-muted'
            )}
        >
            <ClassTile systemKey={asset.suggestedClassKey} colorKey={colorKey} size="sm" />
            <span className="flex min-w-0 flex-1 flex-col text-sm">
                <span className="truncate">
                    <b className="font-bold text-content">{asset.symbol}</b> <span className="text-content-muted">{asset.name}</span>
                </span>
                <span className="text-xs text-content-muted">
                    {t(`kinds.${asset.kind}`)} · <PriceText price={price} />
                </span>
                {exposure === null ? null : <ExposureLine kind={exposure} />}
            </span>
            {held ? <Badge tone="accent">{t('result.held')}</Badge> : null}
        </button>
    );
}
