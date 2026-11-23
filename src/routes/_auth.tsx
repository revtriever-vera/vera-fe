import type { ReactElement } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { BillingProvider } from '@/app/providers/billing-provider';
import { RoleSync } from '@/app/providers/role-sync';
import { SampleDataProvider } from '@/app/providers/sample-data-provider';
import { RequireSession } from '@/features/auth/components/require-session';
import { OnboardingGate } from '@/features/onboarding/components/onboarding-gate';

function AuthLayout(): ReactElement {
    return (
        <RequireSession>
            <RoleSync />
            <OnboardingGate>
                <BillingProvider>
                    <SampleDataProvider>
                        <Outlet />
                    </SampleDataProvider>
                </BillingProvider>
            </OnboardingGate>
        </RequireSession>
    );
}

export const Route = createFileRoute('/_auth')({
    component: AuthLayout
});
