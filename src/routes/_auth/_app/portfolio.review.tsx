import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ReviewPage } from '@/features/portfolio/review/pages/review-page';
import { reviewMonthSchema } from '@/features/portfolio/review/schemas/review-month.schema';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';
import { MonthlyReviewNarrative } from '@/features/summaries/components/monthly-review-narrative';

const reviewSearchSchema = z.object({
    holder: holderSearchSchema,
    month: reviewMonthSchema
});

function PortfolioReviewRoute(): ReactElement {
    return <ReviewPage Narrative={MonthlyReviewNarrative} />;
}

export const Route = createFileRoute('/_auth/_app/portfolio/review')({
    validateSearch: reviewSearchSchema,
    component: PortfolioReviewRoute
});
