import type { ReactElement } from 'react';
import { AssistantLauncher } from '@/features/assistant/components/assistant-launcher';
import { AssistantSlotsContext, type AssistantSlots } from '@/features/assistant/lib/assistant-slots';
import { InvestmentImportReview } from '@/features/portfolio/imports/components/investment-import-review';
import { PayloadFrame } from '@/features/summaries/components/payload-modal';
import { SummaryConsentRequest } from '@/features/summaries/components/summary-consent-request';

export const ASSISTANT_SLOTS: AssistantSlots = {
    ConsentRequest: SummaryConsentRequest,
    SentFrame: PayloadFrame,
    ImportReview: InvestmentImportReview
};

export function AssistantMount(): ReactElement {
    return (
        <AssistantSlotsContext value={ASSISTANT_SLOTS}>
            <AssistantLauncher />
        </AssistantSlotsContext>
    );
}
