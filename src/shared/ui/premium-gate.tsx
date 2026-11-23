import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { PremiumGateStateName } from '@/shared/lib/analytics/events';
import { formatDayMonth } from '@/shared/lib/billing/billing-dates';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import type { FeatureAccess, PaidFeature } from '@/shared/lib/billing/billing-types';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { LockLine } from './lock-line';
import { Loading, Skeleton } from './skeleton';

export interface PremiumGateProps {
    readonly feature: PaidFeature;
    readonly lockText?: ReactNode;
    readonly whenDisabled?: ReactNode;
    readonly children: ReactNode;
}

function useGateView(feature: PaidFeature, state: FeatureAccess): void {
    useEffect((): void => {
        if (state !== 'available' && state !== 'loading') {
            const viewed: PremiumGateStateName = state;
            track('premium_gate_viewed', { feature, state: viewed });
        }
    }, [feature, state]);
}

function PausedLine(): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const billing: BillingState = useBilling();
    const locale: SupportedLocale = useLocale();
    const resetsAt: string | undefined = billing.usage?.resetsAt;
    const text: string = resetsAt === undefined ? t('lock.pausedNoDate') : t('lock.paused', { date: formatDayMonth(resetsAt, locale) });
    return <LockLine action="none">{text}</LockLine>;
}

function PremiumRequiredLine({ feature, lockText }: { readonly feature: PaidFeature; readonly lockText: ReactNode }): ReactElement {
    const billing: BillingState = useBilling();
    return (
        <LockLine
            action={billing.canManage ? 'premium' : 'ownerOnly'}
            onActionClick={(): void => {
                track('premium_gate_clicked', { feature });
            }}
        >
            {lockText}
        </LockLine>
    );
}

export function PremiumGate({ feature, lockText, whenDisabled = null, children }: PremiumGateProps): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const billing: BillingState = useBilling();
    const state: FeatureAccess = billing.featureState(feature);
    useGateView(feature, state);

    if (state === 'loading') {
        return (
            <Loading label={t('lock.loading')}>
                <Skeleton className="h-10 w-full" />
            </Loading>
        );
    }
    if (state === 'available') {
        return <>{children}</>;
    }
    if (state === 'disabled') {
        return <>{whenDisabled}</>;
    }
    if (state === 'paused') {
        return <PausedLine />;
    }
    return <PremiumRequiredLine feature={feature} lockText={lockText ?? t('lock.defaultText')} />;
}
