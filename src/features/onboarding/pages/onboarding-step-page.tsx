import type { ReactElement } from 'react';
import { StepSlot } from '../components/step-slot';
import { ONBOARDING_PATHS } from '../types';

export function AssetsStepSlotPage(): ReactElement {
    return <StepSlot step="assets" nextTo={ONBOARDING_PATHS.banks} />;
}

export function BanksStepSlotPage(): ReactElement {
    return <StepSlot step="banks" nextTo={ONBOARDING_PATHS.done} />;
}
