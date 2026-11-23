import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';
import { OverviewPage } from '@/features/portfolio/overview/pages/overview-page';
import { SummaryCard } from '@/features/summaries/components/summary-card';

const overviewSearchSchema = z.object({
    holder: holderSearchSchema
});

function PortfolioIndexRoute(): ReactElement {
    return <OverviewPage summarySlot={<SummaryCard kind="portfolio" />} />;
}

export const Route = createFileRoute('/_auth/_app/portfolio/')({
    validateSearch: overviewSearchSchema,
    component: PortfolioIndexRoute
});
