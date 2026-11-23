import type { ReactElement } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { alertText } from '../lib/alert-text';
import { useDismissAction, useStopAction, type SeriesAction } from '../lib/use-series-actions';
import { useSeenAction, type SeenAction } from '../lib/use-detail-actions';
import { RECURRING_ALERT_KIND, RECURRING_STATUS, type RecurringAlert, type RecurringAlertKind, type RecurringSeriesView } from '../types';

export interface AlertsStripProps {
    readonly alerts: readonly RecurringAlert[];
    readonly series: readonly RecurringSeriesView[];
    readonly onOpenSeries: (seriesId: string) => void;
}

const STOP_KINDS: ReadonlySet<RecurringAlertKind> = new Set<RecurringAlertKind>([
    RECURRING_ALERT_KIND.returned,
    RECURRING_ALERT_KIND.trialConverted,
    RECURRING_ALERT_KIND.renewal
]);

interface AlertRowProps {
    readonly alert: RecurringAlert;
    readonly series: RecurringSeriesView | undefined;
    readonly canEdit: boolean;
    readonly seen: SeenAction;
    readonly stop: SeriesAction;
    readonly dismiss: SeriesAction;
    readonly onOpenSeries: (seriesId: string) => void;
}

interface AlertButtonProps {
    readonly label: string;
    readonly ariaLabel: string;
    readonly variant: 'secondary' | 'ghost';
    readonly disabled?: boolean;
    readonly onClick: () => void;
}

function AlertButton({ label, ariaLabel, variant, disabled = false, onClick }: AlertButtonProps): ReactElement {
    return (
        <Button size="sm" variant={variant} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>
            {label}
        </Button>
    );
}

function canStopAlert(alert: RecurringAlert, series: RecurringSeriesView | undefined, canEdit: boolean): boolean {
    return canEdit && series?.status === RECURRING_STATUS.confirmed && STOP_KINDS.has(alert.kind);
}

function canDismissAlert(alert: RecurringAlert, series: RecurringSeriesView | undefined, canEdit: boolean): boolean {
    return canEdit && series?.status === RECURRING_STATUS.suggested && alert.kind === RECURRING_ALERT_KIND.stillUsing;
}

interface SeriesButtonsProps {
    readonly alert: RecurringAlert;
    readonly series: RecurringSeriesView;
    readonly canEdit: boolean;
    readonly stop: SeriesAction;
    readonly dismiss: SeriesAction;
}

function SeriesButtons({ alert, series, canEdit, stop, dismiss }: SeriesButtonsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <>
            {canStopAlert(alert, series, canEdit) ? (
                <AlertButton
                    label={t('alerts.stop')}
                    ariaLabel={t('alerts.stopLabel', { name: alert.seriesName })}
                    variant="ghost"
                    disabled={stop.pending}
                    onClick={(): void => {
                        stop.run(series);
                    }}
                />
            ) : null}
            {canDismissAlert(alert, series, canEdit) ? (
                <AlertButton
                    label={t('alerts.dismiss')}
                    ariaLabel={t('alerts.dismissLabel', { name: alert.seriesName })}
                    variant="ghost"
                    disabled={dismiss.pending}
                    onClick={(): void => {
                        dismiss.run(series);
                    }}
                />
            ) : null}
        </>
    );
}

function AlertActions({ alert, series, canEdit, seen, stop, dismiss, onOpenSeries }: AlertRowProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <div className="flex flex-wrap items-center gap-2">
            {series === undefined ? null : (
                <AlertButton
                    label={t('alerts.view')}
                    ariaLabel={t('alerts.viewLabel', { name: alert.seriesName })}
                    variant="secondary"
                    onClick={(): void => {
                        onOpenSeries(alert.seriesId);
                    }}
                />
            )}
            {canEdit && alert.canMarkSeen ? (
                <AlertButton
                    label={t('alerts.seen')}
                    ariaLabel={t('alerts.seenLabel', { name: alert.seriesName })}
                    variant="ghost"
                    disabled={seen.pending}
                    onClick={(): void => {
                        seen.run(alert.id);
                    }}
                />
            ) : null}
            {series === undefined ? null : <SeriesButtons alert={alert} series={series} canEdit={canEdit} stop={stop} dismiss={dismiss} />}
        </div>
    );
}

function AlertRow({ alert, series, canEdit, seen, stop, dismiss, onOpenSeries }: AlertRowProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    return (
        <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-start gap-2.5">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-caution" aria-hidden="true" />
                <p className="min-w-0 break-words text-sm text-content">{alertText(alert, locale, t)}</p>
            </div>
            <AlertActions
                alert={alert}
                series={series}
                canEdit={canEdit}
                seen={seen}
                stop={stop}
                dismiss={dismiss}
                onOpenSeries={onOpenSeries}
            />
        </li>
    );
}

export function AlertsStrip({ alerts, series, onOpenSeries }: AlertsStripProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const seen: SeenAction = useSeenAction();
    const stop: SeriesAction = useStopAction();
    const dismiss: SeriesAction = useDismissAction();
    const byId: ReadonlyMap<string, RecurringSeriesView> = new Map(
        series.map((item: RecurringSeriesView): [string, RecurringSeriesView] => [item.id, item])
    );
    if (alerts.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">{t('alerts.title', { count: alerts.length })}</h3>
            <ul aria-label={t('alerts.listLabel')} className="surface-card divide-y divide-border">
                {alerts.map((alert: RecurringAlert): ReactElement => (
                    <AlertRow
                        key={alert.id}
                        alert={alert}
                        series={byId.get(alert.seriesId)}
                        canEdit={canEdit}
                        seen={seen}
                        stop={stop}
                        dismiss={dismiss}
                        onOpenSeries={onOpenSeries}
                    />
                ))}
            </ul>
            <p className="text-xs text-content-subtle">{t('alerts.note')}</p>
        </section>
    );
}
