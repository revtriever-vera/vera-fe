import { createContext, type Context, type ComponentType, type ReactElement, type ReactNode } from 'react';

export interface SentFrameProps {
    readonly onClose: () => void;
    readonly children: ReactElement;
}

export interface ImportCorrections {
    readonly edits: readonly Readonly<Record<string, unknown>>[];
    readonly fixedIncome: readonly Readonly<Record<string, unknown>>[];
}

export interface ImportReviewProps {
    readonly preview: Readonly<Record<string, unknown>>;
    readonly renderActions: (corrections: ImportCorrections | null) => ReactElement;
}

export interface AssistantSlots {
    readonly ConsentRequest: ComponentType;
    readonly SentFrame: ComponentType<SentFrameProps>;
    readonly ImportReview: ComponentType<ImportReviewProps>;
}

function NoConsentRequest(): ReactNode {
    return null;
}

function BareFrame({ children }: SentFrameProps): ReactElement {
    return children;
}

function NoImportReview({ renderActions }: ImportReviewProps): ReactElement {
    return renderActions(null);
}

export const AssistantSlotsContext: Context<AssistantSlots> = createContext<AssistantSlots>({
    ConsentRequest: NoConsentRequest,
    SentFrame: BareFrame,
    ImportReview: NoImportReview
});
