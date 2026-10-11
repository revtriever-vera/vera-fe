import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useDismissOnboarding } from '../api/use-dismiss-onboarding.mutation';
import { useLeaveOnboarding, type LeaveOnboarding } from '../lib/use-leave-onboarding';
import { useOnboardingRunner, type RunOnboarding } from '../lib/use-onboarding-runner';
import { HOME_PATH } from '../types';

export function DismissDialog({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');
    const dismiss: ReturnType<typeof useDismissOnboarding> = useDismissOnboarding();
    const leave: LeaveOnboarding = useLeaveOnboarding();
    const run: RunOnboarding = useOnboardingRunner();

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
                    async (state) => leave(state, HOME_PATH)
                );
            }}
        />
    );
}
