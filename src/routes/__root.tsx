import type { ReactElement } from 'react';
import { Outlet, createRootRoute, redirect } from '@tanstack/react-router';
import { APP_TARGET } from '@/shared/config/app-target';
import { env } from '@/shared/config/env';

function RootComponent(): ReactElement {
    return <Outlet />;
}

export const Route = createRootRoute({
    beforeLoad: ({ location }): void => {
        if (env.VITE_APP_TARGET === APP_TARGET.admin && location.pathname === '/') {
            throw redirect({ to: '/admin/audit', replace: true });
        }
    },
    component: RootComponent
});
