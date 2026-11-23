import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { priceText } from '../lib/billing-format';
import { checkoutOfferOf, type CheckoutOffer } from '../lib/checkout-offer';
import { useCheckout, type Checkout } from '../lib/use-checkout';
import type { BillingMe } from '../types';
import { CardRedirectDialog } from './checkout-card';
import { CheckoutDone } from './checkout-done';
import { CheckoutSummary, MethodForm } from './checkout-form';
import { CheckoutPix } from './checkout-pix';
import { CheckoutWait } from './checkout-wait';

export interface CheckoutModalProps {
    readonly me: BillingMe;
    readonly startWaiting: boolean;
    readonly onClose: () => void;
}

function CheckoutFooter({
    me,
    checkout,
    onClose
}: {
    readonly me: BillingMe;
    readonly checkout: Checkout;
    readonly onClose: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    if (checkout.stage === 'done') {
        return <Button onClick={onClose}>{t('checkout.done.later')}</Button>;
    }
    const form: boolean = checkout.stage === 'form';
    const offer: CheckoutOffer = checkoutOfferOf(me, new Date());
    const price: string = priceText(offer.firstCents === null ? me : { ...me, priceCents: offer.firstCents }, locale);
    const cardLabel: string = offer.cardOnly ? t('checkout.saveCard') : t('checkout.subscribeCard', { price });
    const label: string = checkout.method === 'card' ? cardLabel : t('checkout.subscribePix');
    return (
        <>
            <Button variant="ghost" onClick={onClose}>
                {form ? t('checkout.cancel') : t('checkout.wait.close')}
            </Button>
            {form ? (
                <Button loading={checkout.subscribing} disabled={checkout.subscribing} onClick={checkout.submit}>
                    {label}
                </Button>
            ) : null}
        </>
    );
}

function CheckoutBody({
    me,
    checkout,
    onClose
}: {
    readonly me: BillingMe;
    readonly checkout: Checkout;
    readonly onClose: () => void;
}): ReactElement | null {
    const paymentUrl: string | null = checkout.paymentUrl;
    const reopen: (() => void) | null =
        paymentUrl === null
            ? null
            : (): void => {
                  window.open(paymentUrl, '_blank', 'noopener');
              };
    switch (checkout.stage) {
        case 'form':
            return (
                <div className="grid gap-4 md:grid-cols-2">
                    <MethodForm me={me} method={checkout.method} onMethod={checkout.setMethod} error={checkout.failure} />
                    <CheckoutSummary me={me} />
                </div>
            );
        case 'pix':
            return <CheckoutPix onPay={checkout.pay} paying={checkout.paying} />;
        case 'wait':
            return <CheckoutWait method={checkout.doneMethod} timedOut={checkout.watch.timedOut} onReopen={reopen} />;
        case 'done':
            return <CheckoutDone onClose={onClose} />;
    }
}

export function CheckoutModal({ me, startWaiting, onClose }: CheckoutModalProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const checkout: Checkout = useCheckout(me, startWaiting);
    const done: boolean = checkout.stage === 'done';
    const doneKey: 'checkout.done.descriptionPix' | 'checkout.done.descriptionCard' =
        checkout.doneMethod === 'pix' ? 'checkout.done.descriptionPix' : 'checkout.done.descriptionCard';
    return (
        <>
            <Modal
                title={done ? t('checkout.done.title') : t('checkout.title')}
                description={done ? t(doneKey) : undefined}
                size="mid"
                fullOnMobile
                onClose={onClose}
                footer={<CheckoutFooter me={me} checkout={checkout} onClose={onClose} />}
            >
                <CheckoutBody me={me} checkout={checkout} onClose={onClose} />
            </Modal>
            {checkout.captureUrl === null ? null : <CardRedirectDialog url={checkout.captureUrl} onCancel={checkout.dismissCapture} />}
        </>
    );
}
