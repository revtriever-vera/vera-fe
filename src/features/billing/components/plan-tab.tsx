import { useCallback, useEffect, useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { Alert } from '@/shared/ui/alert';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { useBillingMe } from '../api/use-billing-me.query';
import { useCardReturn } from '../lib/use-card-return';
import type { CardReturnResult } from '../schemas/billing-search.schema';
import type { BillingMe } from '../types';
import { CheckoutModal } from './checkout-modal';
import { FreePlan } from './free-plan';
import { InvoicesHistory } from './invoices-history';
import { OfferCard } from './offer-card';
import { SubscriptionCard } from './subscription-card';
import { TrialStrip } from './trial-strip';
import { UsageCard } from './usage-card';

export interface PlanTabProps {
    readonly cardResult: CardReturnResult | undefined;
    readonly onCardHandled: () => void;
    readonly peopleCount: number;
}

type Checkout = 'closed' | 'form' | 'waiting';

function PremiumPlan({
    me,
    onSubscribe,
    peopleCount
}: {
    readonly me: BillingMe;
    readonly onSubscribe: () => void;
    readonly peopleCount: number;
}): ReactElement {
    return (
        <div className="flex flex-col gap-4">
            <TrialStrip me={me} onSubscribe={onSubscribe} />
            <SubscriptionCard me={me} onSubscribe={onSubscribe} peopleCount={peopleCount} />
            <OfferCard me={me} />
            {me.usage === null ? null : <UsageCard usage={me.usage} />}
            {me.subscription === null ? null : <InvoicesHistory />}
        </div>
    );
}

export function PlanTab({ cardResult, onCardHandled, peopleCount }: PlanTabProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const query: UseQueryResult<BillingMe> = useBillingMe();
    const [checkout, setCheckout] = useState<Checkout>('closed');
    const onWaiting: () => void = useCallback((): void => {
        setCheckout('waiting');
    }, []);
    const onFailed: () => void = useCallback((): void => {
        setCheckout('closed');
    }, []);
    useCardReturn(query.isPending ? undefined : cardResult, { clear: onCardHandled, onWaiting, onFailed });
    const plan: BillingMe['plan'] | undefined = query.data?.plan;
    useEffect((): void => {
        if (plan === 'free' || plan === 'premium') {
            track('plan_viewed', { plan });
        }
    }, [plan]);
    if (query.isPending) {
        return <SkeletonPanel label={t('planTab.loading')} lines={4} />;
    }
    if (query.isError) {
        return <Alert title={t('planTab.loadFailed')} />;
    }
    const me: BillingMe = query.data;
    const open = (): void => {
        setCheckout('form');
    };
    const close = (): void => {
        setCheckout('closed');
    };
    return (
        <>
            {me.plan === 'premium' ? <PremiumPlan me={me} onSubscribe={open} peopleCount={peopleCount} /> : null}
            {me.plan === 'free' ? <FreePlan me={me} onSubscribe={open} /> : null}
            {checkout === 'closed' ? null : <CheckoutModal me={me} startWaiting={checkout === 'waiting'} onClose={close} />}
        </>
    );
}
