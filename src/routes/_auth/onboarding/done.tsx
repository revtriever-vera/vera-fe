import { createFileRoute } from '@tanstack/react-router';
import { OnboardingDonePage } from '@/features/onboarding/pages/onboarding-done-page';

export const Route = createFileRoute('/_auth/onboarding/done')({
    component: OnboardingDonePage
});
