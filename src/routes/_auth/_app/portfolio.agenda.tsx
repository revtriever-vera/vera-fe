import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { AgendaPage } from '@/features/portfolio/agenda/pages/agenda-page';
import { agendaFilterSchema } from '@/features/portfolio/agenda/schemas/agenda-filter.schema';
import { holderSearchSchema } from '@/features/portfolio/schemas/holder.schema';

const agendaSearchSchema = z.object({
    holder: holderSearchSchema,
    kind: agendaFilterSchema
});

export const Route = createFileRoute('/_auth/_app/portfolio/agenda')({
    validateSearch: agendaSearchSchema,
    component: AgendaPage
});
