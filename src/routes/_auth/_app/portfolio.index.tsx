import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';
import { OverviewPage } from '@/features/portfolio/overview/pages/overview-page';

const overviewSearchSchema = z.object({
    holder: holderSearchSchema
});

export const Route = createFileRoute('/_auth/_app/portfolio/')({
    validateSearch: overviewSearchSchema,
    component: OverviewPage
});
