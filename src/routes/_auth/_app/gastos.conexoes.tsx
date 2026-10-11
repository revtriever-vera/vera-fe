import { createFileRoute } from '@tanstack/react-router';
import { ConnectionsPage } from '@/features/spending/connections/pages/connections-page';

export const Route = createFileRoute('/_auth/_app/gastos/conexoes')({
    component: ConnectionsPage
});
