import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { QuotaMeter } from '@/shared/ui/quota-meter';
import type { BillingUsage } from '../types';

export function UsageCard({ usage }: { readonly usage: BillingUsage }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 className="m-0 text-base font-semibold text-content">{t('planTab.usage.title')}</h2>
                <p className="m-0 text-sm text-content-muted">{t('planTab.usage.description')}</p>
            </div>
            <QuotaMeter usage={usage} full />
        </Card>
    );
}
