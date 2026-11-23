import type { ReactElement } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { PreferencesTab } from '@/features/account/pages/preferences-tab';
import { PrivacyTab } from '@/features/account/pages/privacy-tab';
import { MembersPage } from '@/features/members/pages/members-page';
import { SettingsPlaceholder } from '@/features/settings/components/settings-placeholder';
import { currentSettingsMode, resolveSettingsTab } from '@/features/settings/lib/settings-tabs';
import { useTrackSettingsViewed } from '@/features/settings/lib/use-track-settings-viewed';
import { SETTINGS_TAB, type SettingsTabId } from '@/features/settings/types';
import { ConnectionsPage } from '@/features/spending/connections/pages/connections-page';
import { layoutSearchSchema } from '@/features/spending/schemas/spending-search.schema';

const TAB_CONTENT: Readonly<Record<SettingsTabId, () => ReactElement>> = {
    plan: (): ReactElement => <SettingsPlaceholder title="tabs.plan" tab={SETTINGS_TAB.plan} />,
    integrations: (): ReactElement => <SettingsPlaceholder title="tabs.integrations" tab={SETTINGS_TAB.integrations} />,
    people: (): ReactElement => <MembersPage />,
    whatsapp: (): ReactElement => <SettingsPlaceholder title="tabs.whatsapp" tab={SETTINGS_TAB.whatsapp} />,
    calendar: (): ReactElement => <SettingsPlaceholder title="tabs.calendar" tab={SETTINGS_TAB.calendar} />,
    banks: (): ReactElement => <ConnectionsPage />,
    preferences: (): ReactElement => <PreferencesTab />,
    privacy: (): ReactElement => <PrivacyTab />
};

function SettingsTabRoute(): ReactElement {
    const { tab }: { tab: string } = Route.useParams();
    const resolved: SettingsTabId = resolveSettingsTab(tab, { mode: currentSettingsMode() });
    useTrackSettingsViewed(resolved);
    return TAB_CONTENT[resolved]();
}

export const Route = createFileRoute('/_auth/_app/settings/$tab')({
    validateSearch: layoutSearchSchema,
    beforeLoad: ({ params }): void => {
        const resolved: SettingsTabId = resolveSettingsTab(params.tab, { mode: currentSettingsMode() });
        if (resolved !== params.tab) {
            throw redirect({ to: '/settings/$tab', params: { tab: resolved }, replace: true });
        }
    },
    component: SettingsTabRoute
});
