import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Button } from '@/shared/ui/button';
import { INVOICE_POLL_MAX_MS, INVOICE_POLL_MS, usePolling } from '../lib/poll';

export interface CheckoutPixProps {
    readonly onPay: (invoiceId: string) => void;
    readonly paying: boolean;
}

export function CheckoutPix({ onPay, paying }: CheckoutPixProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const billing: BillingState = useBilling();
    const invoiceId: string | null = billing.openInvoice?.id ?? null;
    const timedOut: boolean = usePolling({
        active: invoiceId === null,
        everyMs: INVOICE_POLL_MS,
        maxMs: INVOICE_POLL_MAX_MS,
        tick: (): void => {
            void billing.refresh();
        }
    });
    if (invoiceId === null) {
        return (
            <output className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="size-8 animate-spin rounded-full border-2 border-border border-t-accent" aria-hidden="true" />
                <p className="text-sm font-semibold text-content">{timedOut ? t('checkout.pix.slow') : t('checkout.pix.generating')}</p>
            </output>
        );
    }
    return (
        <div className="flex flex-col items-start gap-3 py-4">
            <p className="text-sm text-content-muted">{t('checkout.pix.instruction')}</p>
            <Button
                disabled={paying}
                onClick={(): void => {
                    onPay(invoiceId);
                }}
            >
                {t('checkout.pix.pay')}
            </Button>
        </div>
    );
}
