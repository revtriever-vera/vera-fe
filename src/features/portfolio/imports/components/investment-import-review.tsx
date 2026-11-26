import type { ReactElement } from 'react';
import { HOLDER_ALL } from '../../lib/holder-filter';
import {
    correctionsOf,
    useEditing,
    useReviewState,
    type Editing,
    type ReviewCorrections,
    type ReviewState
} from '../lib/use-import-review';
import { readInvestmentPreview } from '../lib/read-preview';
import type { InvestmentPreview } from '../types';
import { AlreadyImported, Notes } from './investment-file-step';
import { InvestmentReviewStep } from './investment-review-step';

export interface InvestmentImportReviewProps {
    readonly preview: Readonly<Record<string, unknown>>;
    readonly renderActions: (corrections: ReviewCorrections | null) => ReactElement;
}

function Review({
    preview,
    renderActions
}: { readonly preview: InvestmentPreview } & Pick<InvestmentImportReviewProps, 'renderActions'>): ReactElement {
    const editing: Editing = useEditing();
    const review: ReviewState = useReviewState(preview, HOLDER_ALL, editing);
    return (
        <div className="flex flex-col gap-4">
            <AlreadyImported at={preview.alreadyImportedAt} />
            <Notes notes={preview.notes} />
            <InvestmentReviewStep flow={review} />
            {renderActions(review.canConfirm ? correctionsOf(preview, review) : null)}
        </div>
    );
}

export function InvestmentImportReview({ preview, renderActions }: InvestmentImportReviewProps): ReactElement {
    const read: InvestmentPreview | null = readInvestmentPreview(preview);
    return read === null ? renderActions(null) : <Review preview={read} renderActions={renderActions} />;
}
