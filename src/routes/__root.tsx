import type { ReactElement } from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';

function RootComponent(): ReactElement {
    return <Outlet />;
}

export const Route = createRootRoute({
    component: RootComponent
});
