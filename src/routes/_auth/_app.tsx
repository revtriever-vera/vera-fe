import type { ReactElement } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/app/layouts/app-shell';
import { APP_NAV_ITEMS } from '@/app/layouts/app-nav';

function AppLayout(): ReactElement {
    return (
        <AppShell items={APP_NAV_ITEMS}>
            <Outlet />
        </AppShell>
    );
}

export const Route = createFileRoute('/_auth/_app')({
    component: AppLayout
});
