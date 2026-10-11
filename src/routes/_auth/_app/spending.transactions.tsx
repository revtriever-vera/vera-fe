import { createFileRoute } from '@tanstack/react-router';
import { transactionsSearchSchema } from '@/features/spending/schemas/spending-search.schema';
import { TransactionsPage } from '@/features/spending/transactions/pages/transactions-page';

export const Route = createFileRoute('/_auth/_app/spending/transactions')({
    validateSearch: transactionsSearchSchema,
    component: TransactionsPage
});
