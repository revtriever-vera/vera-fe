import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { seriesAccountText, seriesDayText, seriesValueText } from '../lib/series-text';
import { RECURRING_CURRENCY, type RecurringCharge, type RecurringSeriesView } from '../types';

export interface ReviewCardProps {
    readonly series: RecurringSeriesView;
    readonly canEdit: boolean;
    readonly busy: boolean;
    readonly onConfirm: (series: RecurringSeriesView) => void;
    readonly onDismiss: (series: RecurringSeriesView) => void;
    readonly onSnooze: (series: RecurringSeriesView) => void;
}

function LastCharges({ charges }: { readonly charges: readonly RecurringCharge[] }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    if (charges.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-content-subtle">{t('review.lastCharges')}</span>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-content-muted">
                {charges.map((charge: RecurringCharge): ReactElement => (
                    <li key={charge.transactionId} className="numeric">
                        {formatIsoDate(charge.date, locale)} · {formatCurrency(charge.amountMinor, RECURRING_CURRENCY, locale)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ReviewSummary({ series }: { readonly series: RecurringSeriesView }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
                <h4 className="min-w-0 break-words text-base font-semibold text-content">{series.name}</h4>
                <Badge>{t(`kind.${series.kind}`)}</Badge>
                {series.knownSubscription ? <Badge tone="accent">{t('review.known')}</Badge> : null}
            </div>
            <p className="text-sm text-content-muted">
                {t(`cadence.${series.cadence}`)} · {seriesDayText(series, t)} ·{' '}
                <span className="numeric">{seriesValueText(series, locale, t)}</span>
            </p>
            <p className="text-xs text-content-subtle">{seriesAccountText(series)}</p>
            {series.dayChange === null ? null : (
                <p className="text-xs text-caution">
                    {t('review.dayChange', { from: series.dayChange.fromDay, to: series.dayChange.toDay })}
                </p>
            )}
        </div>
    );
}

function ReviewActions({ series, busy, onConfirm, onDismiss, onSnooze }: Omit<ReviewCardProps, 'canEdit'>): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                size="sm"
                aria-label={t('review.confirmLabel', { name: series.name })}
                onClick={(): void => {
                    onConfirm(series);
                }}
            >
                {t('review.confirm')}
            </Button>
            <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                aria-label={t('review.dismissLabel', { name: series.name })}
                onClick={(): void => {
                    onDismiss(series);
                }}
            >
                {t('review.dismiss')}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                aria-label={t('review.snoozeLabel', { name: series.name })}
                onClick={(): void => {
                    onSnooze(series);
                }}
            >
                {t('review.snooze')}
            </Button>
        </div>
    );
}

export function ReviewCard(props: ReviewCardProps): ReactElement {
    const { series, canEdit } = props;
    return (
        <li className="surface-card flex flex-col gap-3 p-4">
            <ReviewSummary series={series} />
            <LastCharges charges={series.lastCharges} />
            {canEdit ? <ReviewActions {...props} /> : null}
        </li>
    );
}
