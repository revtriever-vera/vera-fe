import type { ReactElement } from 'react';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { IntegrationsTab } from '@/features/integrations/components/integrations-tab';
import { PreferencesTab } from '@/features/account/pages/preferences-tab';
import { PrivacyTab } from '@/features/account/pages/privacy-tab';
import { MembersPage } from '@/features/members/pages/members-page';
import { SettingsPlaceholder } from '@/features/settings/components/settings-placeholder';
import { resolveSettingsTab } from '@/features/settings/lib/settings-tabs';
import { useSettingsMode, type SettingsModeState } from '@/features/settings/lib/use-settings-mode';
import { useTrackSettingsViewed } from '@/features/settings/lib/use-track-settings-viewed';
import { SETTINGS_TAB, type SettingsTabId } from '@/features/settings/types';
import { ConnectionsPage } from '@/features/spending/connections/pages/connections-page';
import { layoutSearchSchema } from '@/features/spending/schemas/spending-search.schema';

const TAB_CONTENT: Readonly<Record<SettingsTabId, () => ReactElement>> = {
    plan: (): ReactElement => <SettingsPlaceholder title="tabs.plan" tab={SETTINGS_TAB.plan} />,
    integrations: (): ReactElement => <IntegrationsTab />,
    people: (): ReactElement => <MembersPage />,
    whatsapp: (): ReactElement => <SettingsPlaceholder title="tabs.whatsapp" tab={SETTINGS_TAB.whatsapp} />,
    calendar: (): ReactElement => <SettingsPlaceholder title="tabs.calendar" tab={SETTINGS_TAB.calendar} />,
    banks: (): ReactElement => <ConnectionsPage />,
    preferences: (): ReactElement => <PreferencesTab />,
    privacy: (): ReactElement => <PrivacyTab />
};

function SettingsTabRoute(): ReactElement | null {
    const { tab }: { tab: string } = Route.useParams();
    const { mode, ready }: SettingsModeState = useSettingsMode();
    const resolved: SettingsTabId = resolveSettingsTab(tab, { mode });
    useTrackSettingsViewed(resolved, ready);
    if (!ready) {
        return null;
    }
    if (resolved !== tab) {
        return <Navigate to="/settings/$tab" params={{ tab: resolved }} replace />;
    }
    return TAB_CONTENT[resolved]();
}

export const Route = createFileRoute('/_auth/_app/settings/$tab')({
    validateSearch: layoutSearchSchema,
    component: SettingsTabRoute
});
