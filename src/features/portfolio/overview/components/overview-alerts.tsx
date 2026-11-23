import type { ReactElement, ReactNode } from 'react';
import { CalendarClock, ShieldAlert } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/format/currency';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { buttonVariants } from '@/shared/ui/button';
import { useFgc } from '../../fixed-income/api/use-fgc.query';
import { useMaturities } from '../../fixed-income/api/use-maturities.query';
import { ReallocateButton } from '../../fixed-income/components/reallocate-button';
import { useWhenLabel } from '../../fixed-income/lib/use-when-label';
import { overLimitGroups, type OverLimitGroup } from '../../fixed-income/lib/over-limit-groups';
import type { FgcCoverage, MaturityItem } from '../../fixed-income/types';

interface AlertLineProps {
    readonly icon: ReactNode;
    readonly caution?: boolean;
    readonly text: string;
    readonly action: ReactNode;
}

function AlertLine({ icon, caution = false, text, action }: AlertLineProps): ReactElement {
    return (
        <li
            className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-control border px-3 py-2 text-sm',
                caution ? 'border-caution/30 bg-caution/10' : 'border-border bg-surface'
            )}
        >
            <span className="flex min-w-0 items-center gap-2">
                {icon}
                <span>{text}</span>
            </span>
            {action}
        </li>
    );
}

function MaturityAlert({ item }: { readonly item: MaturityItem }): ReactElement {
    const locale: SupportedLocale = useLocale();
    const when: (days: number) => string = useWhenLabel();
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const text: string = t('alerts.maturity', {
        name: item.name,
        when: when(item.daysToMaturity),
        date: formatIsoDate(item.maturityDate, locale),
        amount: formatCurrency(item.reallocateMinor, item.currency, locale)
    });
    return (
        <AlertLine
            icon={<CalendarClock className="size-4 shrink-0" aria-hidden="true" />}
            text={text}
            action={
                <ReallocateButton
                    item={item}
                    primary
                    onClick={(): void => {
                        track('overview_alert_clicked', { kind: 'maturity' });
                    }}
                />
            }
        />
    );
}

function FgcAlert({ item }: { readonly item: OverLimitGroup }): ReactElement {
    const locale: SupportedLocale = useLocale();
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const amount: string = formatCurrency(item.group.overMinor, 'BRL', locale);
    return (
        <AlertLine
            caution
            icon={<ShieldAlert className="size-4 shrink-0 text-caution" aria-hidden="true" />}
            text={
                item.holderName === null
                    ? t('alerts.fgc', { amount, group: item.group.groupName })
                    : t('alerts.fgcHolder', { amount, group: item.group.groupName, holder: item.holderName })
            }
            action={
                <Link
                    to="/portfolio/assets"
                    search={{ tab: 'fixed-income' }}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    onClick={(): void => {
                        track('overview_alert_clicked', { kind: 'fgc' });
                    }}
                >
                    {t('alerts.viewCoverage')}
                </Link>
            }
        />
    );
}

export function OverviewAlerts(): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const maturities: MaturityItem | undefined = useMaturities().data?.items.find((item: MaturityItem): boolean => item.soon);
    const coverage: FgcCoverage | undefined = useFgc().data;
    const overLimit: readonly OverLimitGroup[] = coverage === undefined ? [] : overLimitGroups(coverage);
    if (maturities === undefined && overLimit.length === 0) {
        return null;
    }
    return (
        <ul aria-label={t('alerts.label')} className="flex flex-col gap-2">
            {maturities === undefined ? null : <MaturityAlert item={maturities} />}
            {overLimit.map((item: OverLimitGroup): ReactElement => (
                <FgcAlert key={item.key} item={item} />
            ))}
        </ul>
    );
}
