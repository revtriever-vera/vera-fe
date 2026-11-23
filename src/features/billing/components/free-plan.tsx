import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import type { BillingMe } from '../types';
import { PlanCards } from './plan-cards';
import { PlanCompareTable } from './plan-compare-table';

export interface FreePlanProps {
    readonly me: BillingMe;
    readonly onSubscribe: () => void;
}

export function FreePlan({ me, onSubscribe }: FreePlanProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const billing: BillingState = useBilling();
    return (
        <div className="flex flex-col gap-4">
            <Card className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="m-0 text-base font-semibold text-content">{t('planTab.free.title')}</h2>
                    <p className="m-0 text-sm text-content-muted">{t('planTab.free.description')}</p>
                </div>
                <Badge>{t('planTab.free.chip')}</Badge>
            </Card>
            {me.openInvoice !== null && me.canManage ? (
                <Alert
                    tone="caution"
                    title={t('planTab.free.openInvoice')}
                    action={
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={(): void => {
                                void billing.payInvoice('plan');
                            }}
                        >
                            {t('planTab.free.openInvoicePay')}
                        </Button>
                    }
                />
            ) : null}
            <PlanCards me={me} onSubscribe={onSubscribe} />
            <PlanCompareTable />
        </div>
    );
}
