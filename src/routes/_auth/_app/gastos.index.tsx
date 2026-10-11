import { createFileRoute } from '@tanstack/react-router';
import { monthSearchSchema } from '@/features/spending/schemas/spending-search.schema';
import { SummaryPage } from '@/features/spending/summary/pages/summary-page';

export const Route = createFileRoute('/_auth/_app/gastos/')({
    validateSearch: monthSearchSchema,
    component: SummaryPage
});
