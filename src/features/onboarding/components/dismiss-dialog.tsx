import type { ReactElement } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { track } from '@/shared/lib/analytics';
import { useDismissOnboarding } from '../api/use-dismiss-onboarding.mutation';
import { useLeaveOnboarding, type LeaveOnboarding } from '../lib/use-leave-onboarding';
import { stepOfPath } from '../lib/step-of-path';
import { useOnboardingRunner, type RunOnboarding } from '../lib/use-onboarding-runner';
import { HOME_PATH } from '../types';

export function DismissDialog({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const dismiss: ReturnType<typeof useDismissOnboarding> = useDismissOnboarding();
    const leave: LeaveOnboarding = useLeaveOnboarding();
    const run: RunOnboarding = useOnboardingRunner();
    const pathname: string = useRouterState({ select: (router): string => router.location.pathname });

    return (
        <ConfirmDialog
            title={t('dismissTitle')}
            description={t('dismissDescription')}
            confirmLabel={t('dismissConfirm')}
            cancelLabel={t('dismissKeep')}
            pending={dismiss.isPending}
            onCancel={onClose}
            onConfirm={(): void => {
                void run(
                    async () => dismiss.mutateAsync(),
                    async (state) => {
                        track('onboarding_dismissed', { at: stepOfPath(pathname) });
                        await leave(state, HOME_PATH);
                    }
                );
            }}
        />
    );
}
