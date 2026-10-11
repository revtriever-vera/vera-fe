import type { ReactElement } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { OnboardingFrame } from '@/features/onboarding/components/onboarding-frame';

function OnboardingLayout(): ReactElement {
    return (
        <OnboardingFrame>
            <Outlet />
        </OnboardingFrame>
    );
}

export const Route = createFileRoute('/_auth/onboarding')({
    component: OnboardingLayout
});
