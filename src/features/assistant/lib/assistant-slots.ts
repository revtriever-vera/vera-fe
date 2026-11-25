import { createContext, type Context, type ComponentType, type ReactElement, type ReactNode } from 'react';

export interface SentFrameProps {
    readonly onClose: () => void;
    readonly children: ReactElement;
}

export interface AssistantSlots {
    /** The permission request of the summaries; a feature cannot import another, so `app` wires it. */
    readonly ConsentRequest: ComponentType;
    /** The modal frame that shows what was sent. */
    readonly SentFrame: ComponentType<SentFrameProps>;
}

function NoConsentRequest(): ReactNode {
    return null;
}

function BareFrame({ children }: SentFrameProps): ReactElement {
    return children;
}

export const AssistantSlotsContext: Context<AssistantSlots> = createContext<AssistantSlots>({
    ConsentRequest: NoConsentRequest,
    SentFrame: BareFrame
});
