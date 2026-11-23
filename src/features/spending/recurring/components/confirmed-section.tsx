import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Table, type TableColumn } from '@/shared/ui/table';
import { seriesAccountText, seriesDayText, seriesValueText } from '../lib/series-text';
import { useStopAction, type SeriesAction } from '../lib/use-series-actions';
import { RECURRING_CURRENCY, type RecurringSeriesView } from '../types';

const MIN_WIDTH: string = 'min-w-[44rem]';

interface ConfirmedColumnsInput {
    readonly canEdit: boolean;
    readonly onStop: (series: RecurringSeriesView) => void;
}

function useConfirmedColumns({ canEdit, onStop }: ConfirmedColumnsInput): readonly TableColumn<RecurringSeriesView>[] {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    const columns: TableColumn<RecurringSeriesView>[] = [
        { key: 'name', header: t('confirmed.name'), render: (row): string => row.name },
        { key: 'cadence', header: t('confirmed.cadence'), render: (row): string => t(`cadence.${row.cadence}`) },
        { key: 'day', header: t('confirmed.day'), render: (row): string => seriesDayText(row, t) },
        { key: 'value', header: t('confirmed.value'), align: 'right', render: (row): string => seriesValueText(row, locale, t) },
        { key: 'account', header: t('confirmed.account'), render: (row): string => seriesAccountText(row) },
        {
            key: 'monthly',
            header: t('confirmed.monthly'),
            align: 'right',
            render: (row): string => formatCurrency(row.monthlyEquivalentMinor, RECURRING_CURRENCY, locale)
        }
    ];
    if (!canEdit) {
        return columns;
    }
    return [
        ...columns,
        {
            key: 'actions',
            header: t('confirmed.actions'),
            align: 'right',
            render: (row): ReactElement => (
                <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t('confirmed.stopLabel', { name: row.name })}
                    onClick={(): void => {
                        onStop(row);
                    }}
                >
                    {t('confirmed.stop')}
                </Button>
            )
        }
    ];
}

interface StopDialogProps {
    readonly series: RecurringSeriesView;
    readonly onConfirm: () => void;
    readonly onClose: () => void;
}

function StopDialog({ series, onConfirm, onClose }: StopDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <ConfirmDialog
            title={t('confirmed.stopTitle', { name: series.name })}
            description={t('confirmed.stopDescription')}
            confirmLabel={t('confirmed.stopConfirm')}
            onCancel={onClose}
            onConfirm={onConfirm}
        />
    );
}

export function ConfirmedSection({ series }: { readonly series: readonly RecurringSeriesView[] }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const stop: SeriesAction = useStopAction();
    const [stopping, setStopping] = useState<RecurringSeriesView | null>(null);
    const columns: readonly TableColumn<RecurringSeriesView>[] = useConfirmedColumns({ canEdit, onStop: setStopping });
    if (series.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">{t('confirmed.title')}</h3>
            <Table
                label={t('confirmed.tableLabel')}
                columns={columns}
                rows={series}
                rowKey={(row): string => row.id}
                minWidthClass={MIN_WIDTH}
            />
            {stopping === null ? null : (
                <StopDialog
                    series={stopping}
                    onConfirm={(): void => {
                        stop.run(stopping);
                        setStopping(null);
                    }}
                    onClose={(): void => {
                        setStopping(null);
                    }}
                />
            )}
        </section>
    );
}
