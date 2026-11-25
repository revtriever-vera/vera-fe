import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { LockLine } from '@/shared/ui/lock-line';
import type { MessageView } from '../types';
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

export interface AssistantUpgradeProps {
    readonly access: Exclude<MessageView['access'], 'ok'>;
}

export function AssistantUpgrade({ access }: AssistantUpgradeProps): ReactElement {
    const { ConsentRequest } = useAssistantSlots();
    return access === 'premium_required' ? <PremiumLock /> : <ConsentRequest />;
}
