import { createFileRoute } from '@tanstack/react-router';
import { AssetsStepSlotPage } from '@/features/onboarding/pages/onboarding-step-page';

export const Route = createFileRoute('/_auth/onboarding/assets')({
    component: AssetsStepSlotPage
});
