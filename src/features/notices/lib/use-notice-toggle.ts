import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useUpdateNoticePreference } from '../api/use-update-notice-preference.mutation';
import { noticesErrorMessage } from './notices-error-message';

export interface NoticeToggle {
    readonly pendingType: string | null;
    readonly toggle: (type: string, enabled: boolean) => void;
}

export function useNoticeToggle(): NoticeToggle {
    const { t }: UseTranslationResponse<'notices', undefined> = useTranslation('notices');
    const toast: ToastApi = useToast();
    const mutation: ReturnType<typeof useUpdateNoticePreference> = useUpdateNoticePreference();
    return {
        pendingType: mutation.isPending ? mutation.variables.type : null,
        toggle: (type: string, enabled: boolean): void => {
            mutation.mutate(
                { type, enabled },
                {
                    onSuccess: (): void => {
                        toast.show({ tone: 'positive', title: t(enabled ? 'toast.on' : 'toast.off') });
                    },
                    onError: (error: ApiError): void => {
                        toast.show({ tone: 'critical', title: noticesErrorMessage(t, error) });
                    }
                }
            );
        }
    };
}
