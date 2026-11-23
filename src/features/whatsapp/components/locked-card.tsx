import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Card } from '@/shared/ui/card';
import { LockLine } from '@/shared/ui/lock-line';

export function LockedCard(): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const billing: BillingState = useBilling();
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content">{t('locked.title')}</h2>
                <p className="text-sm text-content-muted">{t('locked.description')}</p>
            </div>
            <LockLine
                action={billing.canManage ? 'premium' : 'ownerOnly'}
                onActionClick={(): void => {
                    track('premium_gate_clicked', { feature: 'whatsapp' });
                }}
            >
                {t('locked.line')}
            </LockLine>
        </Card>
    );
}
