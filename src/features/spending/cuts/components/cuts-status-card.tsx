import { useState, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/cn';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button, buttonVariants } from '@/shared/ui/button';
import { IncomeModeDialog } from '../../components/income-mode-dialog';
import type { CutsResponse } from '../../types';
import { contributionAmount } from '../lib/contribution-link';
import { cutsStatusView, type CutsStatusView } from '../lib/cuts-status-text';
import { formatWhole } from '../lib/format-reais';

const SURFACES: Readonly<Record<'caution' | 'positive' | 'neutral', string>> = {
    caution: 'bg-gradient-to-br from-caution-soft to-surface',
    positive: 'bg-gradient-to-br from-positive-soft to-surface',
    neutral: 'bg-surface'
};

const VALUES: Readonly<Record<'caution' | 'positive', string>> = {
    caution: 'text-caution',
    positive: 'text-positive'
};

function ContributionShortcut({ surplusMinor }: { readonly surplusMinor: number }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const amount: number | null = contributionAmount(surplusMinor);
    if (amount === null) {
        return null;
    }
    return (
        <Link
            to="/portfolio/contribution"
            search={{ amount }}
            className={buttonVariants({ variant: 'secondary' })}
            onClick={(): void => {
                track('spending_contribution_shortcut');
            }}
        >
            {t('status.contribution')}
        </Link>
    );
}

function StatusActions({
    cuts,
    onDefineIncome
}: {
    readonly cuts: CutsResponse;
    readonly onDefineIncome: () => void;
}): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    if (cuts.status === 'goal_met') {
        return <ContributionShortcut surplusMinor={cuts.surplusMinor} />;
    }
    if (cuts.status === 'no_income') {
        return <Button onClick={onDefineIncome}>{t('status.defineIncome')}</Button>;
    }
    return null;
}

function StatusBody({ view, cuts }: { readonly view: CutsStatusView; readonly cuts: CutsResponse }): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const text: string = t(view.textKey, { total: formatWhole(cuts.totalCutMinor, locale), count: view.count });
    return (
        <div className="flex flex-col gap-1">
            {view.labelKey === null ? null : <span className="text-sm font-medium text-content-muted">{t(view.labelKey)}</span>}
            {view.amountMinor === null || view.tone === null ? null : (
                <span className={cn('numeric text-3xl font-extrabold', VALUES[view.tone])}>{formatWhole(view.amountMinor, locale)}</span>
            )}
            <p className="text-sm text-content">{text}</p>
        </div>
    );
}

export function CutsStatusCard({ cuts }: { readonly cuts: CutsResponse }): ReactElement | null {
    const [incomeOpen, setIncomeOpen] = useState<boolean>(false);
    const view: CutsStatusView | null = cutsStatusView(cuts);
    if (view === null) {
        return null;
    }
    return (
        <section className={cn('surface-card flex flex-wrap items-center justify-between gap-4 p-5', SURFACES[view.tone ?? 'neutral'])}>
            <StatusBody view={view} cuts={cuts} />
            <StatusActions
                cuts={cuts}
                onDefineIncome={(): void => {
                    setIncomeOpen(true);
                }}
            />
            <IncomeModeDialog open={incomeOpen} onOpenChange={setIncomeOpen} />
        </section>
    );
}
