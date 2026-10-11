import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ContributionPage } from '@/features/portfolio/contribution/pages/contribution-page';

const contributionSearchSchema = z.object({
    amount: z.number().optional().catch(undefined)
});

export const Route = createFileRoute('/_auth/_app/portfolio/contribution')({
    validateSearch: contributionSearchSchema,
    component: ContributionPage
});
