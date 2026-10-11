import { track } from '@/shared/lib/analytics';
import { useStepActions, type StepActions } from './use-step-actions';

export function useAssetsStepActions(assetCount: number): StepActions {
    const actions: StepActions = useStepActions('assets');
    const leave = (action: () => void): (() => void) => {
        return (): void => {
            track('portfolio_onboarding_assets_step', { count: assetCount });
            action();
        };
    };
    return { ...actions, complete: leave(actions.complete), skip: leave(actions.skip) };
}
