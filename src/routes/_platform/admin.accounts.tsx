import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ComingSoonPage } from '@/features/admin/pages/coming-soon-page';

function AccountsRoute(): ReactElement {
    return <ComingSoonPage section="accounts" />;
}

export const Route = createFileRoute('/_platform/admin/accounts')({
    component: AccountsRoute
});
