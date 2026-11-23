import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { formatCurrency } from '@/shared/lib/format/currency';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Modal } from '@/shared/ui/modal';
import { seriesAccountText, seriesDayText, seriesValueText } from '../lib/series-text';
import { useRemoveChargeAction, type RemoveChargeAction } from '../lib/use-detail-actions';
import { RECURRING_CURRENCY, RECURRING_STATUS, type RecurringCharge, type RecurringSeriesView } from '../types';
import { EditSeriesDialog } from './edit-series-dialog';
import { NoticeBeforeSwitch } from './notice-before-switch';

export interface SeriesDetailDialogProps {
    readonly series: RecurringSeriesView;
    readonly onClose: () => void;
}

interface ChargeListProps {
    readonly series: RecurringSeriesView;
    readonly canRemove: boolean;
    readonly onRemove: (charge: RecurringCharge) => void;
}

function ChargeList({ series, canRemove, onRemove }: ChargeListProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    if (series.lastCharges.length === 0) {
        return <p className="text-sm text-content-muted">{t('detail.noCharges')}</p>;
    }
    return (
        <ul className="flex flex-col divide-y divide-border">
            {series.lastCharges.map((charge: RecurringCharge): ReactElement => {
                const label: string = `${formatIsoDate(charge.date, locale)}, ${formatCurrency(charge.amountMinor, RECURRING_CURRENCY, locale)}`;
                return (
                    <li key={charge.transactionId} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="numeric text-content">{label}</span>
                        {canRemove ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                aria-label={t('detail.removeChargeLabel', {
                                    date: formatIsoDate(charge.date, locale),
                                    amount: formatCurrency(charge.amountMinor, RECURRING_CURRENCY, locale)
                                })}
                                onClick={(): void => {
                                    onRemove(charge);
                                }}
                            >
                                {t('detail.removeCharge')}
                            </Button>
                        ) : null}
                    </li>
                );
            })}
        </ul>
    );
}

function Summary({ series }: { readonly series: RecurringSeriesView }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
                <Badge>{t(`kind.${series.kind}`)}</Badge>
                <Badge tone={series.status === RECURRING_STATUS.confirmed ? 'positive' : 'neutral'}>
                    {t(`detail.status.${series.status}`)}
                </Badge>
            </div>
            <p className="text-sm text-content-muted">
                {t(`cadence.${series.cadence}`)} · {seriesDayText(series, t)} ·{' '}
                <span className="numeric">{seriesValueText(series, locale, t)}</span>
            </p>
            <p className="text-xs text-content-subtle">
                {t('detail.account')}: {seriesAccountText(series)}
            </p>
            <p className="text-xs text-content-subtle">
                {t('detail.nextDate')}: {series.nextDate === null ? t('detail.noNextDate') : formatIsoDate(series.nextDate, locale)}
            </p>
        </div>
    );
}

interface RemoveDialogProps {
    readonly series: RecurringSeriesView;
    readonly pending: boolean;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}

function RemoveDialog({ series, pending, onConfirm, onCancel }: RemoveDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <ConfirmDialog
            title={t('detail.removeTitle', { name: series.name })}
            description={t('detail.removeDescription')}
            confirmLabel={t('detail.removeConfirm')}
            pending={pending}
            onCancel={onCancel}
            onConfirm={onConfirm}
        />
    );
}

interface DetailModalProps {
    readonly series: RecurringSeriesView;
    readonly editable: boolean;
    readonly canRemove: boolean;
    readonly onClose: () => void;
    readonly onEdit: () => void;
    readonly onRemove: (charge: RecurringCharge) => void;
}

function DetailModal({ series, editable, canRemove, onClose, onEdit, onRemove }: DetailModalProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <Modal
            title={series.name}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('detail.close')}
                    </Button>
                    {editable ? <Button onClick={onEdit}>{t('detail.edit')}</Button> : null}
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <Summary series={series} />
                {series.status === RECURRING_STATUS.confirmed ? <NoticeBeforeSwitch seriesId={series.id} /> : null}
                <h3 className="text-sm font-semibold text-content">{t('detail.charges')}</h3>
                <ChargeList series={series} canRemove={canRemove} onRemove={onRemove} />
            </div>
        </Modal>
    );
}

function RemoveStep({
    series,
    charge,
    onDone
}: {
    readonly series: RecurringSeriesView;
    readonly charge: RecurringCharge;
    readonly onDone: () => void;
}): ReactElement {
    const remove: RemoveChargeAction = useRemoveChargeAction();
    return (
        <RemoveDialog
            series={series}
            pending={remove.pending}
            onCancel={onDone}
            onConfirm={(): void => {
                remove.run({ seriesId: series.id, transactionId: charge.transactionId }, series.name, onDone);
            }}
        />
    );
}

export function SeriesDetailDialog({ series, onClose }: SeriesDetailDialogProps): ReactElement {
    const { canEdit } = useRole();
    const [editing, setEditing] = useState<boolean>(false);
    const [removing, setRemoving] = useState<RecurringCharge | null>(null);
    if (editing) {
        return (
            <EditSeriesDialog
                series={series}
                onClose={(): void => {
                    setEditing(false);
                }}
            />
        );
    }
    if (removing !== null) {
        return (
            <RemoveStep
                series={series}
                charge={removing}
                onDone={(): void => {
                    setRemoving(null);
                }}
            />
        );
    }
    return (
        <DetailModal
            series={series}
            editable={canEdit && series.status === RECURRING_STATUS.confirmed}
            canRemove={canEdit}
            onClose={onClose}
            onEdit={(): void => {
                setEditing(true);
            }}
            onRemove={setRemoving}
        />
    );
}
