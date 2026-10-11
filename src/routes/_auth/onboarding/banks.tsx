import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { resolveConnectionsLink } from '@/features/onboarding/lib/connections-link';
import { BanksStepPage } from '@/features/onboarding/pages/banks-step-page';

function BanksRoute(): ReactElement {
    return <BanksStepPage connectionsLink={resolveConnectionsLink(ONBOARDING_DESTINATIONS.connections)} />;
}

export const Route = createFileRoute('/_auth/onboarding/banks')({
    component: BanksRoute
});
