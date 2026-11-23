import type { ReactElement } from 'react';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { firstSettingsTab } from '@/features/settings/lib/settings-tabs';
import { useSettingsMode, type SettingsModeState } from '@/features/settings/lib/use-settings-mode';

function SettingsIndex(): ReactElement | null {
    const { mode, ready }: SettingsModeState = useSettingsMode();
    if (!ready) {
        return null;
    }
    return <Navigate to="/settings/$tab" params={{ tab: firstSettingsTab({ mode }) }} replace />;
}

export const Route = createFileRoute('/_auth/_app/settings/')({
    component: SettingsIndex
});
