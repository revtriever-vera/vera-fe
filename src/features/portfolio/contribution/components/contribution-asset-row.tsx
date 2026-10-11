import type { ReactElement } from 'react';
import { Money } from '@/shared/ui/money';
import type { ContributionAsset } from '../types';
import { UnitsLabel } from './units-label';

export interface ContributionAssetRowProps {
    readonly asset: ContributionAsset;
    readonly currency: string;
}

export function ContributionAssetRow({ asset, currency }: ContributionAssetRowProps): ReactElement {
    return (
        <li className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-content">{asset.symbol}</span>
                <span className="truncate text-xs text-content-muted">{asset.name}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end">
                <Money amountMinor={asset.amountMinor} currency={currency} className="text-sm font-semibold" />
                <span className="text-xs text-content-muted">
                    <UnitsLabel typeGroup={asset.typeGroup} approxUnits={asset.approxUnits} />
                </span>
            </div>
        </li>
    );
}
