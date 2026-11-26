import { createContext, type Context, type ComponentType, type ReactElement, type ReactNode } from 'react';

export interface SentFrameProps {
    readonly onClose: () => void;
    readonly children: ReactElement;
}

export interface AssistantSlots {
    readonly ConsentRequest: ComponentType;
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
