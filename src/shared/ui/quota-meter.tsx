import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { formatDayMonth, periodMonthName, usedPercent } from '@/shared/lib/billing/billing-dates';
import type { BillingUsage, BillingUsageState } from '@/shared/lib/billing/billing-types';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';

const BAR_TONES: Readonly<Record<BillingUsageState, string>> = {
    ok: 'bg-accent',
    warning: 'bg-caution',
    paused: 'bg-critical'
};

export interface QuotaMeterProps {
    readonly usage: BillingUsage;
    readonly full?: boolean;
}

function stateText(t: UseTranslationResponse<'billing', undefined>['t'], state: BillingUsageState, percent: number): string {
    if (state === 'paused') {
        return t('meter.paused');
    }
    return state === 'warning' ? t('meter.nearLimit') : t('meter.remaining', { percent: 100 - percent });
}

function FullDetails({ usage }: { readonly usage: BillingUsage }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const ai: number = usedPercent(usage.byFeature.ai.usedBps);
    const whatsapp: number = usedPercent(usage.byFeature.whatsapp.usedBps);
    return (
        <p className="m-0 text-xs text-content-muted">
            {t('meter.byFeature', { ai, whatsapp })} {t('meter.note')}
        </p>
    );
}

export function QuotaMeter({ usage, full = false }: QuotaMeterProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const percent: number = usedPercent(usage.usedBps);
    return (
        <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold">{t('meter.title', { month: periodMonthName(usage.resetsAt, locale) })}</span>
                <span className="text-sm font-semibold tabular-nums">{t('meter.used', { percent })}</span>
            </div>
            <meter min={0} max={100} value={percent} aria-label={t('meter.label')} className="sr-only" />
            <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-border">
                <div
                    className={cn('h-full rounded-full motion-safe:transition-[width]', BAR_TONES[usage.state])}
                    style={{ width: `${String(percent)}%` }}
                />
            </div>
            <div className="flex justify-between gap-3 text-xs text-content-muted">
                <span>{t('meter.renews', { date: formatDayMonth(usage.resetsAt, locale) })}</span>
                <span>{stateText(t, usage.state, percent)}</span>
            </div>
            {full ? <FullDetails usage={usage} /> : null}
        </div>
    );
}
