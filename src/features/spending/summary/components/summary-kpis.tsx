import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { KpiTile } from '@/shared/ui/kpi';
import { formatRateBps } from '../../lib/format-bps';
import type { MonthlySummary } from '../../types';

export interface SummaryKpisProps {
    readonly summary: MonthlySummary;
    readonly onChangeIncome: () => void;
}

function IncomeSupport({ mode, onChangeIncome }: { readonly mode: string; readonly onChangeIncome: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    return (
        <span className="flex flex-wrap items-center gap-x-2">
            <span>{mode === 'declared' ? t('kpis.incomeDeclared') : t('kpis.incomeFromTransactions')}</span>
            <button
                type="button"
                aria-label={t('kpis.incomeChangeLabel')}
                onClick={onChangeIncome}
                className="font-semibold text-accent-strong underline underline-offset-2"
            >
                {t('kpis.incomeChange')}
            </button>
        </span>
    );
}

export function SummaryKpis({ summary, onChangeIncome }: SummaryKpisProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    const locale: SupportedLocale = useLocale();
    const money = (minor: number): string => formatCurrency(minor, summary.currency, locale);
    const rate: string | undefined = summary.savingsRateBps === null ? undefined : formatRateBps(summary.savingsRateBps, locale);
    return (
        <section aria-label={t('kpis.label')} className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 lg:grid-cols-4">
            <KpiTile
                label={t('kpis.income')}
                value={money(summary.income.minor)}
                support={<IncomeSupport mode={summary.income.mode} onChangeIncome={onChangeIncome} />}
            />
            <KpiTile label={t('kpis.expenses')} value={money(summary.expensesMinor)} />
            <KpiTile label={t('kpis.saved')} value={money(summary.savedMinor)} support={rate} focus />
            <KpiTile label={t('kpis.goal')} value={money(summary.goal.minor)} support={formatRateBps(summary.goal.bps, locale)} />
        </section>
    );
}
