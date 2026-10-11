import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Table, type TableColumn } from '@/shared/ui/table';
import { formatMonthTitle } from '../../lib/format-month';
import type { CutSuggestion, CutsResponse } from '../../types';
import { AverageValue, CutCategory, CutValue, WholeAmount } from './cut-cells';

const MIN_WIDTH_CLASS: string = 'min-w-[34rem]';

function useCutsColumns(cuts: CutsResponse): readonly TableColumn<CutSuggestion>[] {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    return [
        {
            key: 'category',
            header: t('table.columns.category'),
            render: (row: CutSuggestion): ReactElement => <CutCategory suggestion={row} />
        },
        {
            key: 'spent',
            header: formatMonthTitle(cuts.month, locale),
            align: 'right',
            render: (row: CutSuggestion): ReactElement => <WholeAmount minor={row.spentMinor} />
        },
        {
            key: 'average',
            header: t('table.columns.average'),
            align: 'right',
            render: (row: CutSuggestion): ReactElement => <AverageValue suggestion={row} averageMonths={cuts.averageMonths} />
        },
        {
            key: 'cut',
            header: t('table.columns.cut'),
            align: 'right',
            render: (row: CutSuggestion): ReactElement => <CutValue cutMinor={row.cutMinor} />
        },
        {
            key: 'limit',
            header: t('table.columns.limit'),
            align: 'right',
            render: (row: CutSuggestion): ReactElement => <WholeAmount minor={row.limitMinor} className="font-bold" />
        }
    ];
}

export function CutsTable({ cuts }: { readonly cuts: CutsResponse }): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const columns: readonly TableColumn<CutSuggestion>[] = useCutsColumns(cuts);
    return (
        <Table
            label={t('table.label')}
            columns={columns}
            rows={cuts.suggestions}
            rowKey={(row: CutSuggestion): string => row.categoryId}
            minWidthClass={MIN_WIDTH_CLASS}
        />
    );
}
