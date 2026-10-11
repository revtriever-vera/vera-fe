import { createFileRoute } from '@tanstack/react-router';
import { layoutSearchSchema } from '@/features/spending/schemas/spending-search.schema';
import { SpendingLayout } from '@/features/spending/pages/spending-layout';

export const Route = createFileRoute('/_auth/_app/gastos')({
    validateSearch: layoutSearchSchema,
    component: SpendingLayout
});
