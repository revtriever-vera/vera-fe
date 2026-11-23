import { useCallback, type ReactElement } from 'react';
import { Navigate, createFileRoute, useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { CalendarTab } from '@/features/calendar/components/calendar-tab';
import { calendarSearchSchema, type CalendarSearch } from '@/features/calendar/schemas/calendar-search.schema';
import { IntegrationsTab } from '@/features/integrations/components/integrations-tab';
import { PreferencesTab } from '@/features/account/pages/preferences-tab';
import { PrivacyTab } from '@/features/account/pages/privacy-tab';
import { MembersPage } from '@/features/members/pages/members-page';
import { SettingsPlaceholder } from '@/features/settings/components/settings-placeholder';
import { resolveSettingsTab } from '@/features/settings/lib/settings-tabs';
import { useSettingsMode, type SettingsModeState } from '@/features/settings/lib/use-settings-mode';
import { useTrackSettingsViewed } from '@/features/settings/lib/use-track-settings-viewed';
import { SETTINGS_TAB, type SettingsTabId } from '@/features/settings/types';
import { WhatsAppTab } from '@/features/whatsapp/components/whatsapp-tab';
import { ConnectionsPage } from '@/features/spending/connections/pages/connections-page';
import { SummariesPrivacyCard } from '@/features/summaries/components/summaries-privacy-card';
import { layoutSearchSchema } from '@/features/spending/schemas/spending-search.schema';

const TAB_CONTENT: Readonly<Record<SettingsTabId, () => ReactElement>> = {
    plan: (): ReactElement => <SettingsPlaceholder title="tabs.plan" tab={SETTINGS_TAB.plan} />,
    integrations: (): ReactElement => <IntegrationsTab />,
    people: (): ReactElement => <MembersPage />,
    whatsapp: (): ReactElement => <WhatsAppTab />,
    calendar: (): ReactElement => <CalendarRoute />,
    banks: (): ReactElement => <ConnectionsPage />,
    preferences: (): ReactElement => <PreferencesTab />,
    privacy: (): ReactElement => <PrivacyTab summariesSlot={<SummariesPrivacyCard />} />
};

function CalendarRoute(): ReactElement {
    const search: CalendarSearch = Route.useSearch();
    const navigate: UseNavigateResult<'/settings/$tab'> = useNavigate({ from: '/settings/$tab' });
    const clear = useCallback((): void => {
        void navigate({ search: {}, replace: true });
    }, [navigate]);
    return <CalendarTab returned={{ connected: search.connected !== undefined, error: search.error }} onReturnHandled={clear} />;
}

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
    validateSearch: layoutSearchSchema.extend(calendarSearchSchema.shape),
    component: SettingsTabRoute
});
