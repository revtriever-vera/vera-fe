import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AssetsPage } from '@/features/portfolio/assets/pages/assets-page';

const assetsSearchSchema = z.object({
    add: z.boolean().optional().catch(undefined),
    classId: z.string().optional().catch(undefined)
});

export const Route = createFileRoute('/patrimonio/ativos')({
    validateSearch: assetsSearchSchema,
    component: AssetsPage
});
