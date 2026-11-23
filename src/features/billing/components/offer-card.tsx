import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { OfferSummary } from '@/shared/ui/offer-summary';
import { longDate } from '../lib/billing-format';
import type { BillingMe } from '../types';

export function OfferCard({ me }: { readonly me: BillingMe }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const offer: BillingMe['offer'] = me.offer;
    if (offer === null) {
        return null;
    }
    return (
        <Card className="flex flex-col gap-2">
            <h2 className="m-0 text-base font-semibold text-content">{t('planTab.offer.title')}</h2>
            <OfferSummary trial={offer.trial} rules={offer.rules} />
            <p className="m-0 text-sm text-content-muted">{t('planTab.offer.expires', { date: longDate(offer.expiresAt, locale) })}</p>
            {me.canManage ? null : <p className="m-0 text-sm text-content-muted">{t('planTab.ownerOnly')}</p>}
        </Card>
    );
}
