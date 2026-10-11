import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ONBOARDING_DESTINATIONS } from '@/app/onboarding-destinations';
import { resolveConnectionsLink, resolveImportLink } from '@/features/onboarding/lib/connections-link';
import { BanksStepPage } from '@/features/onboarding/pages/banks-step-page';

function BanksRoute(): ReactElement {
    const connectionsLink: string | null = resolveConnectionsLink(ONBOARDING_DESTINATIONS.connections);
    return <BanksStepPage connectionsLink={connectionsLink} importLink={resolveImportLink(connectionsLink)} />;
}

export const Route = createFileRoute('/_auth/onboarding/banks')({
    component: BanksRoute
});
