import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Table, type TableColumn } from '@/shared/ui/table';
import { SignedAmount } from '../../components/signed-amount';
import { SPENDING_CURRENCY, type ImportPreview } from '../../types';

type SampleRow = ImportPreview['sample'][number] & { readonly index: number };

export function PreviewSampleTable({ preview }: { readonly preview: ImportPreview }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const locale: SupportedLocale = useLocale();
    if (preview.sample.length === 0) {
        return null;
    }
    const currency: string = preview.currency ?? SPENDING_CURRENCY;
    const columns: readonly TableColumn<SampleRow>[] = [
        { key: 'date', header: t('preview.columns.date'), render: (row: SampleRow): string => formatIsoDate(row.date, locale) },
        { key: 'description', header: t('preview.columns.description'), render: (row: SampleRow): string => row.description },
        {
            key: 'amount',
            header: t('preview.columns.amount'),
            align: 'right',
            render: (row: SampleRow): ReactElement => <SignedAmount amountMinor={row.amountMinor} currency={currency} />
        }
    ];
    return (
        <Table
            label={t('preview.sampleLabel')}
            columns={columns}
            rows={preview.sample.map((row: ImportPreview['sample'][number], index: number): SampleRow => ({ ...row, index }))}
            rowKey={(row: SampleRow): string => String(row.index)}
        />
    );
}
