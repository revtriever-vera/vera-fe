import type { ReactElement } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/settings/pages/settings-page';

function SettingsLayout(): ReactElement {
    return (
        <SettingsPage>
            <Outlet />
        </SettingsPage>
    );
}

export const Route = createFileRoute('/_auth/_app/settings')({
    component: SettingsLayout
});
