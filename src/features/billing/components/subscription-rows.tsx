import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button, buttonVariants } from '@/shared/ui/button';
import { longDate, priceText } from '../lib/billing-format';
import { useCardSwap, type CardSwap } from '../lib/use-card-swap';
import type { BillingMe, BillingSubscription } from '../types';
import { CardRedirectDialog } from './checkout-card';

type Translate = UseTranslationResponse<'billing', undefined>['t'];

const PEOPLE_PARAMS: { readonly tab: string } = { tab: 'people' };

export interface RowProps {
    readonly title: string;
    readonly children: ReactNode;
    readonly action?: ReactNode;
}

export function Row({ title, children, action }: RowProps): ReactElement {
    return (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
                <span className="text-sm font-semibold text-content">{title}</span>
                <span className="text-sm text-content-muted">{children}</span>
            </div>
            {action}
        </div>
    );
}

export function PeopleRow({ count }: { readonly count: number }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    if (count < 2) {
        return null;
    }
    return (
        <Row
            title={t('planTab.subscription.people.title')}
            action={
                <Link to="/settings/$tab" params={PEOPLE_PARAMS} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                    {t('planTab.subscription.people.action')}
                </Link>
            }
        >
            {t('planTab.subscription.people.text', { count })}
        </Row>
    );
}

export function nextChargeText(t: Translate, me: BillingMe, subscription: BillingSubscription, locale: SupportedLocale): string {
    if (subscription.status === 'canceled') {
        return subscription.paidThrough === null
            ? t('planTab.subscription.next.noneNoDate')
            : t('planTab.subscription.next.none', { date: longDate(subscription.paidThrough, locale) });
    }
    if (subscription.status === 'trialing' && subscription.nextChargeAt !== null) {
        return t('planTab.subscription.next.trialing', { date: longDate(subscription.nextChargeAt, locale) });
    }
    const price: string = priceText(me, locale);
    const line: string =
        subscription.nextChargeAt === null
            ? t('planTab.subscription.next.lineNoDate', { price })
            : t('planTab.subscription.next.line', { date: longDate(subscription.nextChargeAt, locale), price });
    return subscription.method === 'pix' ? `${line} · ${t('planTab.subscription.next.pixNote')}` : line;
}

function methodText(t: Translate, subscription: BillingSubscription): string {
    if (subscription.method === 'pix') {
        return t('planTab.subscription.method.pix');
    }
    return subscription.card === null
        ? t('planTab.subscription.method.cardNoDetails')
        : t('planTab.subscription.method.card', { brand: subscription.card.brand, last4: subscription.card.last4 });
}

function MethodActions({ subscription, swap }: { readonly subscription: BillingSubscription; readonly swap: CardSwap }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const billing: BillingState = useBilling();
    const live: boolean = subscription.status === 'active' || subscription.status === 'past_due';
    const swapKey: 'planTab.subscription.method.changeCard' | 'planTab.subscription.method.useCard' =
        subscription.method === 'card' ? 'planTab.subscription.method.changeCard' : 'planTab.subscription.method.useCard';
    return (
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
            {live ? (
                <Button size="sm" variant="secondary" loading={swap.pending} disabled={swap.pending} onClick={swap.start}>
                    {t(swapKey)}
                </Button>
            ) : null}
        </div>
    );
}

export function MethodRow({
    subscription,
    canManage
}: {
    readonly subscription: BillingSubscription;
    readonly canManage: boolean;
}): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const billing: BillingState = useBilling();
    const swap: CardSwap = useCardSwap();
    return (
        <>
            <Row
                title={t('planTab.subscription.method.title')}
                action={canManage ? <MethodActions subscription={subscription} swap={swap} /> : null}
            >
                {methodText(t, subscription)}
                {billing.openInvoice === null ? null : ` · ${t('planTab.subscription.method.openInvoice')}`}
            </Row>
            {swap.url === null ? null : <CardRedirectDialog url={swap.url} onCancel={swap.close} />}
        </>
    );
}
