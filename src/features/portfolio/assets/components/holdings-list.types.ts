import type { AssetClassView, BaseCurrency, HoldingView } from '../../types';

export interface HoldingsListProps {
    readonly holdings: readonly HoldingView[];
    readonly classes: readonly AssetClassView[];
    readonly baseCurrency: BaseCurrency;
    readonly onEdit: (holding: HoldingView) => void;
    readonly onRemove: (holding: HoldingView) => void;
}
