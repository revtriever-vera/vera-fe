import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';
import { ASSETS_TABS } from '@/features/portfolio/assets/types';
import { AssetsPage } from '@/features/portfolio/assets/pages/assets-page';

const assetsSearchSchema = z.object({
    add: z.boolean().optional().catch(undefined),
    classId: z.string().optional().catch(undefined),
    holder: holderSearchSchema,
    tab: z.enum(ASSETS_TABS).optional().catch(undefined)
});

export const Route = createFileRoute('/_auth/_app/portfolio/assets')({
    validateSearch: assetsSearchSchema,
    component: AssetsPage
});
