import { createFileRoute } from '@tanstack/react-router';
import { BanksStepSlotPage } from '@/features/onboarding/pages/onboarding-step-page';

export const Route = createFileRoute('/_auth/onboarding/banks')({
    component: BanksStepSlotPage
});
