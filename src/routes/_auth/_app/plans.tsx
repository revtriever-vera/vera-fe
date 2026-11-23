import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_app/plans')({
    beforeLoad: (): never => {
        throw redirect({ to: '/settings/$tab', params: { tab: 'plan' }, replace: true });
    }
});
