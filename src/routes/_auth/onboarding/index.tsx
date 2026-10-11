import { createFileRoute } from '@tanstack/react-router';
import { OnboardingIndexPage } from '@/features/onboarding/pages/onboarding-index-page';

export const Route = createFileRoute('/_auth/onboarding/')({
    component: OnboardingIndexPage
});
