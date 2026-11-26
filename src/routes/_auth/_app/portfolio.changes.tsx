import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ChangesPage } from '@/features/portfolio/changes/pages/changes-page';
import { changesWindowSchema } from '@/features/portfolio/changes/schemas/changes-window.schema';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';

const changesSearchSchema = z.object({
    holder: holderSearchSchema,
    days: changesWindowSchema
});

export const Route = createFileRoute('/_auth/_app/portfolio/changes')({
    validateSearch: changesSearchSchema,
    component: ChangesPage
});
