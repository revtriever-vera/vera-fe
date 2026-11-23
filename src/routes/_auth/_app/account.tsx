import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_app/account')({
    beforeLoad: (): never => {
        throw redirect({ to: '/settings/$tab', params: { tab: 'preferences' }, replace: true });
    }
});
