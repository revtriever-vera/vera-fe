import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Card } from '@/shared/ui/card';
import { LockLine } from '@/shared/ui/lock-line';
import { CalendarHeading } from './calendar-heading';

export function CalendarLockedCard(): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const billing: BillingState = useBilling();
    return (
        <Card className="flex flex-col gap-3">
            <CalendarHeading />
            <LockLine
                action={billing.canManage ? 'premium' : 'ownerOnly'}
                onActionClick={(): void => {
                    track('premium_gate_clicked', { feature: 'calendar' });
                }}
            >
                {t('locked.line')}
            </LockLine>
        </Card>
    );
}
