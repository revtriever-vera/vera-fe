import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { useDismissAction, useSnoozeAction, type SeriesAction } from '../lib/use-series-actions';
import type { RecurringSeriesView } from '../types';
import { ConfirmSeriesDialog } from './confirm-series-dialog';
import { ReviewCard } from './review-card';

export function ReviewSection({ series }: { readonly series: readonly RecurringSeriesView[] }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const dismiss: SeriesAction = useDismissAction();
    const snooze: SeriesAction = useSnoozeAction();
    const [confirming, setConfirming] = useState<RecurringSeriesView | null>(null);
    if (series.length === 0) {
        return null;
    }
    return (
        <section className="flex flex-col gap-3">
            <div>
                <h3 className="text-lg font-bold">{t('review.title', { count: series.length })}</h3>
                <p className="text-sm text-content-muted">{t('review.description')}</p>
            </div>
            <ul aria-label={t('review.listLabel')} className="grid items-start gap-3 lg:grid-cols-2">
                {series.map((item: RecurringSeriesView): ReactElement => (
                    <ReviewCard
                        key={item.id}
                        series={item}
                        canEdit={canEdit}
                        busy={dismiss.pending || snooze.pending}
                        onConfirm={setConfirming}
                        onDismiss={dismiss.run}
                        onSnooze={snooze.run}
                    />
                ))}
            </ul>
            {confirming === null ? null : (
                <ConfirmSeriesDialog
                    series={confirming}
                    onClose={(): void => {
                        setConfirming(null);
                    }}
                />
            )}
        </section>
    );
}
