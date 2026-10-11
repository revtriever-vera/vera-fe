import { createFileRoute } from '@tanstack/react-router';
import { monthSearchSchema } from '@/features/spending/schemas/spending-search.schema';
import { CutsPage } from '@/features/spending/cuts/pages/cuts-page';

export const Route = createFileRoute('/_auth/_app/gastos/cortes')({
    validateSearch: monthSearchSchema,
    component: CutsPage
});
