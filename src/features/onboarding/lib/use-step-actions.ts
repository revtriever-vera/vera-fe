import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { track } from '@/shared/lib/analytics';
import { useCompleteStep } from '../api/use-complete-step.mutation';
import { useSkipStep } from '../api/use-skip-step.mutation';
import type { OnboardingStepKey } from '../types';
import { nextStepRoute } from './next-step-route';
import { useOnboardingRunner, type RunOnboarding } from './use-onboarding-runner';

export interface StepActions {
    readonly complete: () => void;
    readonly skip: () => void;
    readonly completing: boolean;
    readonly skipping: boolean;
}

export function useStepActions(step: OnboardingStepKey): StepActions {
    const navigate: UseNavigateResult<string> = useNavigate();
    const run: RunOnboarding = useOnboardingRunner();
    const completeStep: ReturnType<typeof useCompleteStep> = useCompleteStep();
    const skipStep: ReturnType<typeof useSkipStep> = useSkipStep();

    return {
        complete: (): void => {
            void run(
                async () => completeStep.mutateAsync(step),
                async (state) => {
                    track('onboarding_step_completed', { step });
                    await navigate({ to: nextStepRoute(state, step) });
                }
            );
        },
        skip: (): void => {
            void run(
                async () => skipStep.mutateAsync(step),
                async (state) => {
                    track('onboarding_step_skipped', { step });
                    await navigate({ to: nextStepRoute(state, step) });
                }
            );
        },
        completing: completeStep.isPending,
        skipping: skipStep.isPending
    };
}
