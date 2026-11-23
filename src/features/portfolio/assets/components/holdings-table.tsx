import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Table, type TableColumn } from '@/shared/ui/table';
import type { AssetClassView, HoldingView } from '../../types';
import { AssetCell, QuantityOrTitle } from './asset-cell';
import { ClassSelectCell } from './class-select-cell';
import { HoldingRowActions } from './holding-row-actions';
import type { HoldingsListProps } from './holdings-list.types';
import { QuantityCell } from './quantity-cell';
import { SourceCell } from './source-cell';
import { ValueCell } from './value-cell';

type Translate = UseTranslationResponse<'portfolioAssets', undefined>['t'];

function identityColumns(
    t: Translate,
    classes: readonly AssetClassView[],
    onCompleteIssuer: HoldingsListProps['onCompleteIssuer']
): readonly TableColumn<HoldingView>[] {
    const classOf = (holding: HoldingView): AssetClassView | undefined =>
        classes.find((item: AssetClassView): boolean => item.id === holding.classId);
    return [
        {
            key: 'asset',
            header: t('columns.asset'),
            render: (holding: HoldingView): ReactElement => <AssetCell holding={holding} assetClass={classOf(holding)} />
        },
        {
            key: 'class',
            header: t('columns.class'),
            render: (holding: HoldingView): ReactElement => <ClassSelectCell holding={holding} classes={classes} />
        },
        {
            key: 'quantity',
            header: t('columns.quantity'),
            render: (holding: HoldingView): ReactElement => (
                <QuantityOrTitle
                    holding={holding}
                    quantity={<QuantityCell key={holding.quantity} holding={holding} />}
                    onCompleteIssuer={onCompleteIssuer}
                />
            )
        }
    ];
}

function valueColumns(
    t: Translate,
    { baseCurrency, onEdit, onRemove }: Pick<HoldingsListProps, 'baseCurrency' | 'onEdit' | 'onRemove'>
): readonly TableColumn<HoldingView>[] {
    return [
        {
            key: 'value',
            header: t('columns.value'),
            render: (holding: HoldingView): ReactElement => <ValueCell holding={holding} baseCurrency={baseCurrency} />
        },
        {
            key: 'source',
            header: t('columns.source'),
            render: (holding: HoldingView): ReactElement => <SourceCell holding={holding} />
        },
        {
            key: 'actions',
            header: t('columns.actions'),
            render: (holding: HoldingView): ReactElement => <HoldingRowActions holding={holding} onEdit={onEdit} onRemove={onRemove} />
        }
    ];
}

function withoutActions(columns: readonly TableColumn<HoldingView>[], canEdit: boolean): readonly TableColumn<HoldingView>[] {
    return canEdit ? columns : columns.filter((column: TableColumn<HoldingView>): boolean => column.key !== 'actions');
}

const MIN_WIDTH: string = 'min-w-[60rem]';

export function HoldingsTable({ holdings, classes, baseCurrency, onEdit, onCompleteIssuer, onRemove }: HoldingsListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const { canEdit } = useRole();
    const columns: readonly TableColumn<HoldingView>[] = withoutActions(
        [...identityColumns(t, classes, onCompleteIssuer), ...valueColumns(t, { baseCurrency, onEdit, onRemove })],
        canEdit
    );
    return (
        <Table
            label={t('page.tableLabel')}
            columns={columns}
            rows={holdings}
            rowKey={(holding: HoldingView): string => `${holding.kind}-${holding.id}`}
            minWidthClass={MIN_WIDTH}
        />
    );
}
