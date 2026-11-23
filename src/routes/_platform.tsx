import type { ReactElement } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { PlatformGate } from '@/features/admin/components/platform-gate';
import { RequirePlatformSession } from '@/features/admin/components/require-platform-session';

function PlatformLayout(): ReactElement {
    return (
        <RequirePlatformSession>
            <AdminShell>
                <PlatformGate>
                    <Outlet />
                </PlatformGate>
            </AdminShell>
        </RequirePlatformSession>
    );
}

export const Route = createFileRoute('/_platform')({
    component: PlatformLayout
});
