import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Button } from '@/shared/ui/button';
import { useRestoreAction, type SeriesAction } from '../lib/use-series-actions';
import { seriesValueText } from '../lib/series-text';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { RecurringSeriesView } from '../types';

interface InactiveGroupProps {
    readonly title: string;
    readonly series: readonly RecurringSeriesView[];
    readonly canEdit: boolean;
    readonly restore: SeriesAction;
}

function noteOf(series: RecurringSeriesView, t: TFunction<'spendingRecurring'>): string {
    if (series.status !== 'stopped') {
        return '';
    }
    return series.stoppedBy === 'auto' ? t('inactive.stoppedAuto') : t('inactive.stoppedByUser');
}

function InactiveGroup({ title, series, canEdit, restore }: InactiveGroupProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const locale: SupportedLocale = useLocale();
    if (series.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-content-muted">{title}</h4>
            <ul className="flex flex-col gap-2">
                {series.map((item: RecurringSeriesView): ReactElement => (
                    <li key={item.id} className="surface-card flex flex-wrap items-center justify-between gap-2 p-3">
                        <div className="flex min-w-0 flex-col">
                            <span className="break-words text-sm font-medium text-content">{item.name}</span>
                            <span className="text-xs text-content-subtle">
                                {t(`cadence.${item.cadence}`)} · {seriesValueText(item, locale, t)}
                                {noteOf(item, t) === '' ? '' : ` · ${noteOf(item, t)}`}
                            </span>
                        </div>
                        {canEdit ? (
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={restore.pending}
                                aria-label={t('inactive.restoreLabel', { name: item.name })}
                                onClick={(): void => {
                                    restore.run(item);
                                }}
                            >
                                {t('inactive.restore')}
                            </Button>
                        ) : null}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export interface InactiveSectionProps {
    readonly stopped: readonly RecurringSeriesView[];
    readonly dismissed: readonly RecurringSeriesView[];
}

export function InactiveSection({ stopped, dismissed }: InactiveSectionProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const { canEdit } = useRole();
    const restore: SeriesAction = useRestoreAction();
    const total: number = stopped.length + dismissed.length;
    if (total === 0) {
        return null;
    }
    return (
        <details className="flex flex-col gap-3">
            <summary className="cursor-pointer text-lg font-bold">{t('inactive.title', { count: total })}</summary>
            <div className="mt-3 flex flex-col gap-4">
                <InactiveGroup title={t('inactive.stopped')} series={stopped} canEdit={canEdit} restore={restore} />
                <InactiveGroup title={t('inactive.dismissed')} series={dismissed} canEdit={canEdit} restore={restore} />
            </div>
        </details>
    );
}
