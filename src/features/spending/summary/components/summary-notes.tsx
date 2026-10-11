import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { formatRateBps } from '../../lib/format-bps';
import type { MonthlySummary } from '../../types';

export interface SummaryNotesProps {
    readonly summary: MonthlySummary;
    readonly onChangeIncome: () => void;
}

export function FixedNote({ summary }: { readonly summary: MonthlySummary }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    if (summary.fixedMinor <= 0) {
        return null;
    }
    const fixed: string = formatCurrency(summary.fixedMinor, summary.currency, locale);
    return (
        <p className="text-sm text-content-muted">
            {summary.fixedShareBps === null
                ? t('notes.fixedNoIncome', { fixed })
                : t('notes.fixed', { fixed, share: formatRateBps(summary.fixedShareBps, locale) })}
        </p>
    );
}

function IncomeMissingAlert({ onChangeIncome }: { readonly onChangeIncome: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    return (
        <Alert
            tone="caution"
            title={t('notes.incomeMissing')}
            action={
                <Button variant="secondary" onClick={onChangeIncome}>
                    {t('notes.incomeMissingAction')}
                </Button>
            }
        />
    );
}

export function SummaryNotes({ summary, onChangeIncome }: SummaryNotesProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    const money = (minor: number): string => formatCurrency(minor, summary.currency, locale);
    const incomeMissing: boolean = summary.income.mode === 'transactions' && summary.income.fromTransactionsMinor === 0;
    return (
        <div className="flex flex-col gap-2">
            {incomeMissing ? <IncomeMissingAlert onChangeIncome={onChangeIncome} /> : null}
            {summary.uncategorizedInflowMinor > 0 ? (
                <p className="text-sm text-content-muted">
                    {t('notes.uncategorizedInflow', { amount: money(summary.uncategorizedInflowMinor) })}
                </p>
            ) : null}
            {summary.transfersOutMinor > 0 ? (
                <p className="text-sm text-content-muted">{t('notes.transfers', { amount: money(summary.transfersOutMinor) })}</p>
            ) : null}
            {summary.excludedCurrencyCount > 0 ? (
                <p className="text-sm text-content-muted">{t('notes.excludedCurrency', { count: summary.excludedCurrencyCount })}</p>
            ) : null}
        </div>
    );
}
