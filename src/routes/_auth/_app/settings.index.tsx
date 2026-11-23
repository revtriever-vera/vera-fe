import { createFileRoute, redirect } from '@tanstack/react-router';
import { currentSettingsMode, firstSettingsTab } from '@/features/settings/lib/settings-tabs';

export const Route = createFileRoute('/_auth/_app/settings/')({
    beforeLoad: (): never => {
        throw redirect({ to: '/settings/$tab', params: { tab: firstSettingsTab({ mode: currentSettingsMode() }) }, replace: true });
    }
});
