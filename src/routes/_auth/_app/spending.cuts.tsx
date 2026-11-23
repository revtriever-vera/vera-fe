import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { monthSearchSchema } from '@/features/spending/schemas/spending-search.schema';
import { CutsPage, type CutsSummaryContext } from '@/features/spending/cuts/pages/cuts-page';
import { SummaryCard } from '@/features/summaries/components/summary-card';

function SpendingCutsRoute(): ReactElement {
    return (
        <CutsPage
            renderSummary={({ month, goalBps }: CutsSummaryContext): ReactElement => (
                <SummaryCard kind="cuts" month={month} goalBps={goalBps} />
            )}
        />
    );
}

export const Route = createFileRoute('/_auth/_app/spending/cuts')({
    validateSearch: monthSearchSchema,
    component: SpendingCutsRoute
});
