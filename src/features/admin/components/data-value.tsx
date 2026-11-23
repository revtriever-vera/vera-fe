import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Table, type TableColumn } from '@/shared/ui/table';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { columnsOf, fieldText, humanizeKey, isRecord, MAX_ROWS, recordRows, scalarText, type ScalarLabels } from '../lib/account-data-view';

export interface DataValueProps {
    readonly value: unknown;
}

const MIN_WIDTH: string = 'min-w-[40rem]';

function useScalarLabels(): ScalarLabels {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return { yes: t('valueYes'), no: t('valueNo'), empty: t('valueEmpty') };
}

function RowsTable({ rows, label }: { readonly rows: readonly Record<string, unknown>[]; readonly label: string }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const labels: ScalarLabels = useScalarLabels();
    const locale: SupportedLocale = useLocale();
    const shown: readonly Record<string, unknown>[] = rows.slice(0, MAX_ROWS);
    const columns: readonly TableColumn<Record<string, unknown>>[] = columnsOf(rows).map(
        (key: string): TableColumn<Record<string, unknown>> => ({
            key,
            header: humanizeKey(key),
            render: (row: Record<string, unknown>): string => fieldText(key, row[key], labels, locale, row['currency'])
        })
    );
    return (
        <div className="flex flex-col gap-2">
            <Table
                label={label}
                columns={columns}
                rows={shown}
                rowKey={(row: Record<string, unknown>): string => String(shown.indexOf(row))}
                minWidthClass={MIN_WIDTH}
            />
            {rows.length > MAX_ROWS ? (
                <p className="text-xs text-content-muted">{t('dataTruncated', { shown: MAX_ROWS, total: rows.length })}</p>
            ) : null}
        </div>
    );
}

function Entries({ record }: { readonly record: Record<string, unknown> }): ReactElement {
    const labels: ScalarLabels = useScalarLabels();
    const locale: SupportedLocale = useLocale();
    return (
        <dl className="flex flex-col gap-2">
            {Object.entries(record).map(([key, inner]: [string, unknown]): ReactElement => (
                <div key={key} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <dt className="text-sm text-content-muted sm:w-56 sm:shrink-0">{humanizeKey(key)}</dt>
                    <dd className="min-w-0 flex-1 text-sm break-words">
                        {typeof inner === 'object' && inner !== null ? (
                            <DataValue value={inner} />
                        ) : (
                            fieldText(key, inner, labels, locale, record['currency'])
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function DataValue({ value }: DataValueProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const labels: ScalarLabels = useScalarLabels();
    const rows: readonly Record<string, unknown>[] | null = recordRows(value);
    if (rows !== null) {
        return <RowsTable rows={rows} label={t('dataTableLabel')} />;
    }
    if (isRecord(value)) {
        return Object.keys(value).length === 0 ? <span>{t('valueEmpty')}</span> : <Entries record={value} />;
    }
    if (Array.isArray(value)) {
        return (
            <span>{value.length === 0 ? t('valueEmpty') : value.map((item: unknown): string => scalarText(item, labels)).join(', ')}</span>
        );
    }
    return <span>{scalarText(value, labels)}</span>;
}
