import type { ReactElement } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { RequireSession } from '@/features/auth/components/require-session';
import { OnboardingGate } from '@/features/onboarding/components/onboarding-gate';

function AuthLayout(): ReactElement {
    return (
        <RequireSession>
            <OnboardingGate>
                <Outlet />
            </OnboardingGate>
        </RequireSession>
    );
}

export const Route = createFileRoute('/_auth')({
    component: AuthLayout
});
