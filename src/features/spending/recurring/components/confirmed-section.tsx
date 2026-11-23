import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { ResponsiveRows } from '@/shared/ui/responsive-rows';
import type { TableColumn } from '@/shared/ui/table';
import { seriesAccountText, seriesDayText, seriesValueText } from '../lib/series-text';
import { useStopAction, type SeriesAction } from '../lib/use-series-actions';
import { RECURRING_CURRENCY, type RecurringSeriesView } from '../types';

const MIN_WIDTH: string = 'min-w-[44rem]';

interface ConfirmedColumnsInput {
    readonly canEdit: boolean;
    readonly onOpen: (series: RecurringSeriesView) => void;
    readonly onStop: (series: RecurringSeriesView) => void;
}

interface RowActionsProps {
    readonly row: RecurringSeriesView;
    readonly canEdit: boolean;
    readonly onOpen: (series: RecurringSeriesView) => void;
    readonly onStop: (series: RecurringSeriesView) => void;
}

function RowActions({ row, canEdit, onOpen, onStop }: RowActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <div className="flex justify-end gap-1">
            <Button
                size="sm"
                variant="ghost"
                aria-label={t('confirmed.detailsLabel', { name: row.name })}
                onClick={(): void => {
                    onOpen(row);
                }}
            >
                {t('confirmed.details')}
            </Button>
            {canEdit ? (
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
            ) : null}
        </div>
    );
}

function useConfirmedColumns({ canEdit, onOpen, onStop }: ConfirmedColumnsInput): readonly TableColumn<RecurringSeriesView>[] {
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
    return [
        ...columns,
        {
            key: 'actions',
            header: t('confirmed.actions'),
            align: 'right',
            render: (row): ReactElement => <RowActions row={row} canEdit={canEdit} onOpen={onOpen} onStop={onStop} />
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

export interface ConfirmedSectionProps {
    readonly series: readonly RecurringSeriesView[];
    readonly onOpenSeries: (seriesId: string) => void;
}

export function ConfirmedSection({ series, onOpenSeries }: ConfirmedSectionProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const stop: SeriesAction = useStopAction();
    const [stopping, setStopping] = useState<RecurringSeriesView | null>(null);
    const columns: readonly TableColumn<RecurringSeriesView>[] = useConfirmedColumns({
        canEdit,
        onOpen: (item: RecurringSeriesView): void => {
            onOpenSeries(item.id);
        },
        onStop: setStopping
    });
    if (series.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">{t('confirmed.title')}</h3>
            <ResponsiveRows
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
