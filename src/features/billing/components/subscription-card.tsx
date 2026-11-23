import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { longDate, priceText } from '../lib/billing-format';
import { useCardSwap, type CardSwap } from '../lib/use-card-swap';
import type { BillingMe, BillingSubscription } from '../types';
import { CardRedirectDialog } from './checkout-card';
import { SubscriptionButtons } from './subscription-actions';
import { MethodRow, PeopleRow, Row, nextChargeText } from './subscription-rows';

type Translate = UseTranslationResponse<'billing', undefined>['t'];

function PastDueAlert({ subscription }: { readonly subscription: BillingSubscription }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const billing: BillingState = useBilling();
    const swap: CardSwap = useCardSwap();
    const until: string | null = subscription.graceEndsAt;
    const title: string =
        until === null ? t('planTab.subscription.pastDueNoDate') : t('planTab.subscription.pastDue', { date: longDate(until, locale) });
    return (
        <>
            <Alert
                tone="caution"
                title={title}
                action={
                    billing.canManage ? (
                        <div className="flex flex-wrap gap-2">
                            {billing.openInvoice === null ? null : (
                                <Button
                                    size="sm"
                                    onClick={(): void => {
                                        void billing.payInvoice('plan');
                                    }}
                                >
                                    {t('planTab.subscription.method.pay')}
                                </Button>
                            )}
                            <Button size="sm" variant="secondary" disabled={swap.pending} onClick={swap.start}>
                                {t('planTab.subscription.method.useCard')}
                            </Button>
                        </div>
                    ) : undefined
                }
            />
            {swap.url === null ? null : <CardRedirectDialog url={swap.url} onCancel={swap.close} />}
        </>
    );
}

function chipOf(t: Translate, status: BillingSubscription['status']): ReactElement {
    if (status === 'canceled') {
        return <Badge tone="caution">{t('planTab.subscription.chipCanceled')}</Badge>;
    }
    if (status === 'past_due') {
        return <Badge tone="critical">{t('planTab.subscription.chipPastDue')}</Badge>;
    }
    return <Badge tone="positive">{t('planTab.subscription.chipActive')}</Badge>;
}

function TrialRow({ me, onSubscribe }: { readonly me: BillingMe; readonly onSubscribe: () => void }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    if (me.trial === null) {
        return null;
    }
    const subscribable: boolean = me.canManage && me.methods.length > 0 && me.subscription === null;
    return (
        <Row
            title={t('planTab.subscription.trial.title')}
            action={
                subscribable ? (
                    <Button size="sm" onClick={onSubscribe}>
                        {t('planTab.cards.subscribe')}
                    </Button>
                ) : undefined
            }
        >
            {t('planTab.subscription.trial.text', { days: me.trial.daysLeft, date: longDate(me.trial.endsAt, locale) })}
        </Row>
    );
}

function SubscriptionRows({
    me,
    subscription,
    peopleCount
}: {
    readonly me: BillingMe;
    readonly subscription: BillingSubscription;
    readonly peopleCount: number;
}): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    return (
        <>
            <PeopleRow count={peopleCount} />
            <Row title={t('planTab.subscription.next.title')}>{nextChargeText(t, me, subscription, locale)}</Row>
            <MethodRow subscription={subscription} canManage={me.canManage} />
            {me.canManage ? (
                <SubscriptionButtons subscription={subscription} />
            ) : (
                <p className="m-0 text-sm text-content-muted">{t('planTab.ownerOnly')}</p>
            )}
        </>
    );
}

function describe(t: Translate, me: BillingMe, locale: SupportedLocale): string {
    const price: string = priceText(me, locale);
    const since: string | null = me.subscription?.since ?? null;
    return since === null
        ? t('planTab.subscription.descriptionNoDate', { price })
        : t('planTab.subscription.description', { price, date: longDate(since, locale) });
}

export interface SubscriptionCardProps {
    readonly me: BillingMe;
    readonly onSubscribe: () => void;
    readonly peopleCount?: number;
}

export function SubscriptionCard({ me, onSubscribe, peopleCount = 1 }: SubscriptionCardProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const subscription: BillingSubscription | null = me.subscription;
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="m-0 text-base font-semibold text-content">{t('planTab.subscription.title')}</h2>
                    <p className="m-0 text-sm text-content-muted">{describe(t, me, locale)}</p>
                </div>
                {chipOf(t, subscription?.status ?? 'active')}
            </div>
            {subscription?.status === 'past_due' ? <PastDueAlert subscription={subscription} /> : null}
            <TrialRow me={me} onSubscribe={onSubscribe} />
            {subscription === null ? null : <SubscriptionRows me={me} subscription={subscription} peopleCount={peopleCount} />}
        </Card>
    );
}
