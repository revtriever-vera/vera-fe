import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { GOAL_CREATE_KINDS } from '@/features/portfolio/goals/types';
import { GoalsPage } from '@/features/portfolio/goals/pages/goals-page';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';

const goalsSearchSchema = z.object({
    holder: holderSearchSchema,
    create: z.enum(GOAL_CREATE_KINDS).optional().catch(undefined)
});

export const Route = createFileRoute('/_auth/_app/portfolio/goals')({
    validateSearch: goalsSearchSchema,
    component: GoalsPage
});
