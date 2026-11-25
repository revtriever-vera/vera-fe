import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { LockLine } from '@/shared/ui/lock-line';
import { useAssistantSlots } from '../lib/use-assistant-slots';

function PremiumLock(): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const billing: BillingState = useBilling();
    return (
        <LockLine
            action={billing.canManage ? 'premium' : 'ownerOnly'}
            onActionClick={(): void => {
                track('premium_gate_clicked', { feature: 'ai' });
            }}
        >
            {t('upgrade.lock')}
        </LockLine>
    );
}

export function AssistantUpgrade(): ReactElement | null {
    const billing: BillingState = useBilling();
    const { ConsentRequest } = useAssistantSlots();
    const access: ReturnType<BillingState['featureState']> = billing.featureState('ai');
    if (access === 'premium_required') {
        return <PremiumLock />;
    }
    return access === 'loading' || access === 'disabled' ? null : <ConsentRequest />;
}
