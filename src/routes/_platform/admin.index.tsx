import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_platform/admin/')({
    beforeLoad: (): never => {
        throw redirect({ to: '/admin/audit', replace: true });
    }
});
