import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Plug, Target, Wallet } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { useLocale } from '@/shared/lib/i18n';
import { formatCurrency } from '@/shared/lib/format/currency';
import type { SupportedLocale } from '@/shared/lib/locale';
import { ONBOARDING_PATHS, type AreaSummary, type OnboardingSummary } from '../types';
import { SummaryRow } from './summary-row';

const ACTION_CLASS: string =
    'inline-flex h-8 items-center rounded-control border border-border bg-surface px-3 text-xs font-semibold text-content shadow-control hover:bg-surface-muted';

function RowAction({ to, label }: { readonly to: string; readonly label: string }): ReactElement {
    return (
        <Link to={to} className={ACTION_CLASS}>
            {label}
        </Link>
    );
}

function AssetsRow({ area }: { readonly area: AreaSummary }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const locale: SupportedLocale = useLocale();
    if (area.items === 0) {
        return (
            <SummaryRow
                done={false}
                icon={Wallet}
                title={t('assetsPending')}
                detail={t('assetsPendingDetail')}
                action={<RowAction to={ONBOARDING_PATHS.assets} label={t('assetsPendingAction')} />}
            />
        );
    }
    const title: string =
        area.amountCents === null || area.currency === null
            ? t('assetsDoneCount', { count: area.items })
            : t('assetsDone', { count: area.items, amount: formatCurrency(area.amountCents, area.currency, locale) });
    return <SummaryRow done icon={Wallet} title={title} detail={t('assetsDoneDetail')} />;
}

function banksDetail(
    t: (key: 'banksConnections' | 'banksImports', options: { count: number }) => string,
    area: AreaSummary
): string | null {
    const parts: string[] = [];
    const connections: number = area.breakdown?.['connections'] ?? 0;
    const imports: number = area.breakdown?.['imports'] ?? 0;
    if (connections > 0) {
        parts.push(t('banksConnections', { count: connections }));
    }
    if (imports > 0) {
        parts.push(t('banksImports', { count: imports }));
    }
    return parts.length === 0 ? null : parts.join(' · ');
}

function BanksRow({ area }: { readonly area: AreaSummary }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    if (area.items === 0) {
        return (
            <SummaryRow
                done={false}
                icon={Plug}
                title={t('banksPending')}
                detail={t('banksPendingDetail')}
                action={<RowAction to={ONBOARDING_PATHS.banks} label={t('banksPendingAction')} />}
            />
        );
    }
    return (
        <SummaryRow done icon={Plug} title={t('banksDone', { count: area.items })} detail={banksDetail(t, area) ?? t('banksDoneDetail')} />
    );
}

export function SummaryRows({ summary }: { readonly summary: OnboardingSummary }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    return (
        <div className="grid gap-3">
            {summary.assets === null ? null : <AssetsRow area={summary.assets} />}
            {summary.banks === null ? null : <BanksRow area={summary.banks} />}
            {summary.target === null ? null : (
                <SummaryRow
                    done
                    icon={Target}
                    title={t('targetTitle')}
                    detail={t('targetDetail')}
                    action={<RowAction to={ONBOARDING_DESTINATIONS.target} label={t('targetAction')} />}
                />
            )}
        </div>
    );
}
