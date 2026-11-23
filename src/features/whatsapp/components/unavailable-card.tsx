import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

const INTEGRATIONS_PARAMS: { readonly tab: string } = { tab: 'integrations' };

export function UnavailableCard(): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const billing: BillingState = useBilling();
    const selfHosted: boolean = billing.mode === 'self_hosted';
    return (
        <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-content">{t('unavailable.title')}</h2>
            <p className="text-sm text-content-muted">{selfHosted ? t('unavailable.selfHosted') : t('unavailable.hosted')}</p>
            {selfHosted ? (
                <Link to="/settings/$tab" params={INTEGRATIONS_PARAMS} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                    {t('unavailable.integrations')}
                </Link>
            ) : null}
        </Card>
    );
}
