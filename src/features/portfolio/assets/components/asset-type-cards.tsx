import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { IconTile } from '@/shared/ui/icon-tile';
import { useClasses } from '../../api/use-classes.query';
import { useHoldings } from '../../api/use-holdings.query';
import { CLASS_TILE_TONES } from '../../components/class-tile';
import type { AssetClassView, ClassColorKey, HoldingView } from '../../types';
import { ADD_ASSET_TYPES, ASSET_TYPE_SPECS, typeColorKey, type AddAssetType } from '../lib/asset-types';
import { countByType } from '../lib/held-positions';

export interface AssetTypeCardsProps {
    readonly onSelect: (type: AddAssetType) => void;
    readonly focusType?: AddAssetType | null;
    readonly className?: string;
}

interface TypeCardProps {
    readonly type: AddAssetType;
    readonly colorKey: ClassColorKey;
    readonly count: number;
    readonly onSelect: (type: AddAssetType) => void;
}

function TypeCard({ type, colorKey, count, onSelect }: TypeCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <button
            type="button"
            data-type={type}
            onClick={(): void => {
                onSelect(type);
            }}
            className="relative flex items-center gap-3 rounded-card border border-border bg-surface p-3 text-left transition-colors hover:border-accent hover:bg-surface-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
        >
            <IconTile icon={ASSET_TYPE_SPECS[type].icon} tone="neutral" className={CLASS_TILE_TONES[colorKey]} />
            <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-content">{t(`types.${type}.name`)}</span>
                <span className="text-xs text-content-muted">{t(`types.${type}.description`)}</span>
            </span>
            {count > 0 ? (
                <span className="ml-auto shrink-0 rounded-control bg-accent/10 px-2 py-0.5 text-2xs font-semibold text-accent-strong">
                    {t('typeCards.count', { count })}
                </span>
            ) : null}
        </button>
    );
}

function useFocusType(focusType: AddAssetType | null | undefined): RefObject<HTMLDivElement | null> {
    const container: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
    useEffect((): void => {
        if (focusType !== null && focusType !== undefined) {
            container.current?.querySelector<HTMLButtonElement>(`[data-type="${focusType}"]`)?.focus();
        }
    }, [focusType]);
    return container;
}

export function AssetTypeCards({ onSelect, focusType, className }: AssetTypeCardsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const holdings: readonly HoldingView[] = useHoldings().data?.data ?? [];
    const classes: readonly AssetClassView[] = useClasses().data?.data ?? [];
    const container: RefObject<HTMLDivElement | null> = useFocusType(focusType);
    return (
        <div
            ref={container}
            role="group"
            aria-label={t('typeCards.label')}
            className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}
        >
            {ADD_ASSET_TYPES.map((type: AddAssetType): ReactElement => (
                <TypeCard
                    key={type}
                    type={type}
                    colorKey={typeColorKey(classes, type)}
                    count={countByType(holdings, type)}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
