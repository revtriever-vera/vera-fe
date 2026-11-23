import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { HoldingGoalBadges } from '../../goals/components/holding-goal-badges';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { needsIssuer } from '../lib/holding-flags';
import type { AssetClassView, HoldingView } from '../../types';
import { CompleteIssuerBadge } from './complete-issuer-badge';

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
                <HoldingGoalBadges kind={holding.kind} holdingId={holding.id} />
            </span>
        </div>
    );
}

export interface QuantityOrTitleProps {
    readonly holding: HoldingView;
    readonly quantity: ReactElement;
    readonly onCompleteIssuer: (holding: HoldingView) => void;
}

export function QuantityOrTitle({ holding, quantity, onCompleteIssuer }: QuantityOrTitleProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    if (holding.kind !== 'fixed_income') {
        return quantity;
    }
    return (
        <span className="flex flex-wrap items-center gap-1.5">
            <Badge>{t('titleChip')}</Badge>
            {needsIssuer(holding) ? <CompleteIssuerBadge holding={holding} onComplete={onCompleteIssuer} /> : null}
        </span>
    );
}
