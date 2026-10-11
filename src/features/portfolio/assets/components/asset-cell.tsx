import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import type { AssetClassView, HoldingView } from '../../types';

export interface AssetCellProps {
    readonly holding: HoldingView;
    readonly assetClass: AssetClassView | undefined;
}

export function AssetCell({ holding, assetClass }: AssetCellProps): ReactElement {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <ClassTile systemKey={assetClass?.systemKey ?? null} colorKey={toClassColorKey(assetClass?.colorKey ?? '')} size="sm" />
            <span className="flex min-w-0 flex-col">
                <b className="truncate text-sm font-bold text-content">{holding.symbol}</b>
                <span className="truncate text-xs text-content-muted">{holding.name}</span>
            </span>
        </div>
    );
}

export function QuantityOrTitle({ holding, quantity }: { readonly holding: HoldingView; readonly quantity: ReactElement }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return holding.kind === 'fixed_income' ? <Badge>{t('titleChip')}</Badge> : quantity;
}
