import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { AssetClassView, HoldingView } from '../../types';
import { AssetCell, QuantityOrTitle } from './asset-cell';
import { ClassSelectCell } from './class-select-cell';
import { HoldingRowActions } from './holding-row-actions';
import type { HoldingsListProps } from './holdings-list.types';
import { QuantityCell } from './quantity-cell';
import { SourceCell } from './source-cell';
import { ValueCell } from './value-cell';

interface CardProps extends Omit<HoldingsListProps, 'holdings' | 'classes'> {
    readonly holding: HoldingView;
    readonly classes: readonly AssetClassView[];
}

function HoldingCard({ holding, classes, baseCurrency, onEdit, onRemove }: CardProps): ReactElement {
    return (
        <li className="surface-card flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
                <AssetCell holding={holding} assetClass={classes.find((item: AssetClassView): boolean => item.id === holding.classId)} />
                <ValueCell holding={holding} baseCurrency={baseCurrency} />
            </div>
            <ClassSelectCell holding={holding} classes={classes} />
            <div className="flex items-center justify-between gap-2">
                <QuantityOrTitle holding={holding} quantity={<QuantityCell key={holding.quantity} holding={holding} />} />
                <SourceCell holding={holding} />
            </div>
            <HoldingRowActions holding={holding} onEdit={onEdit} onRemove={onRemove} />
        </li>
    );
}

export function HoldingsCardList({ holdings, classes, baseCurrency, onEdit, onRemove }: HoldingsListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <ul aria-label={t('page.listLabel')} className="flex flex-col gap-3">
            {holdings.map((holding: HoldingView): ReactElement => (
                <HoldingCard
                    key={`${holding.kind}-${holding.id}`}
                    holding={holding}
                    classes={classes}
                    baseCurrency={baseCurrency}
                    onEdit={onEdit}
                    onRemove={onRemove}
                />
            ))}
        </ul>
    );
}
