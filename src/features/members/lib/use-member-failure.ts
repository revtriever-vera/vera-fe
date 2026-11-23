import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { membersErrorMessage } from './members-error-message';

export function useMemberFailure(): (error: Error) => void {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const toast = useToast();
    return (error: Error): void => {
        if (error instanceof ApiError && error.problem.type === 'members.forbidden_role') {
            return;
        }
        toast.show({ tone: 'critical', title: membersErrorMessage(t, error) });
    };
}
