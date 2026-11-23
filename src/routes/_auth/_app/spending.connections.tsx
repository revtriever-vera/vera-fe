import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_app/spending/connections')({
    beforeLoad: ({ search }): never => {
        throw redirect({ to: '/settings/$tab', params: { tab: 'banks' }, search: { import: search.import }, replace: true });
    }
});
