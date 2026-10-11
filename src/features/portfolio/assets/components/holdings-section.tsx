import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import type { AssetClassView, BaseCurrency, HoldingView } from '../../types';
import { EditFixedIncomeModal } from './edit-fixed-income-modal';
import { HoldingsCardList } from './holdings-card-list';
import type { HoldingsListProps } from './holdings-list.types';
import { HoldingsTable } from './holdings-table';
import { RemoveHoldingDialog } from './remove-holding-dialog';

const NARROW_QUERY: string = '(max-width: 639px)';

export interface HoldingsSectionProps {
    readonly holdings: readonly HoldingView[];
    readonly classes: readonly AssetClassView[];
    readonly baseCurrency: BaseCurrency;
}

export function HoldingsSection({ holdings, classes, baseCurrency }: HoldingsSectionProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const narrow: boolean = useMediaQuery(NARROW_QUERY);
    const [editing, setEditing] = useState<HoldingView | null>(null);
    const [removing, setRemoving] = useState<HoldingView | null>(null);
    const List: (props: HoldingsListProps) => ReactElement = narrow ? HoldingsCardList : HoldingsTable;
    return (
        <div className="flex flex-col gap-3">
            <List holdings={holdings} classes={classes} baseCurrency={baseCurrency} onEdit={setEditing} onRemove={setRemoving} />
            <p className="text-xs text-content-muted">{t('page.reclassifyNote')}</p>
            {editing === null ? null : (
                <EditFixedIncomeModal
                    titleId={editing.id}
                    name={editing.symbol}
                    classes={classes}
                    onClose={(): void => {
                        setEditing(null);
                    }}
                />
            )}
            {removing === null ? null : (
                <RemoveHoldingDialog
                    holding={removing}
                    onClose={(): void => {
                        setRemoving(null);
                    }}
                />
            )}
        </div>
    );
}
