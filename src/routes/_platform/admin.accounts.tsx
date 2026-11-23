import { createFileRoute } from '@tanstack/react-router';
import { AccountsPage } from '@/features/admin/pages/accounts-page';

export const Route = createFileRoute('/_platform/admin/accounts')({
    component: AccountsPage
});
