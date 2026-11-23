import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { monthSearchSchema } from '@/features/spending/schemas/spending-search.schema';
import { SummaryPage } from '@/features/spending/summary/pages/summary-page';
import { SummaryCard } from '@/features/summaries/components/summary-card';

function SpendingIndexRoute(): ReactElement {
    return <SummaryPage renderSummary={(month: string): ReactElement => <SummaryCard kind="month" month={month} />} />;
}

export const Route = createFileRoute('/_auth/_app/spending/')({
    validateSearch: monthSearchSchema,
    component: SpendingIndexRoute
});
