import { useEffect, type ReactElement } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { ApiError } from '@/shared/lib/api/api-error';
import type { SessionIdentity } from '@/features/auth/types';
import { toSessionUser } from './to-session-user';
import { useSession } from './session-provider';
import { useToast, type ToastApi } from './toast-provider';

const FORBIDDEN_ROLE: string = 'members.forbidden_role';

function isRoleFailure(error: unknown): boolean {
    return error instanceof ApiError && error.problem.type === FORBIDDEN_ROLE;
}

export function RoleSync(): ReactElement | null {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const queryClient: QueryClient = useQueryClient();
    const { replaceUser } = useSession();
    const toast: ToastApi = useToast();

    useEffect((): (() => void) => {
        const onFailure = (error: unknown): void => {
            if (!isRoleFailure(error)) {
                return;
            }
            toast.show({ tone: 'critical', title: t('roleChanged') });
            void apiClient.GET('/auth/me').then(
                (result): void => {
                    replaceUser(toSessionUser(unwrap<SessionIdentity>(result)));
                },
                (): void => undefined
            );
        };
        const stopQueries: () => void = queryClient.getQueryCache().subscribe((event): void => {
            if (event.type === 'updated' && event.action.type === 'error') {
                onFailure(event.action.error);
            }
        });
        const stopMutations: () => void = queryClient.getMutationCache().subscribe((event): void => {
            if (event.type === 'updated' && event.action.type === 'error') {
                onFailure(event.action.error);
            }
        });
        return (): void => {
            stopQueries();
            stopMutations();
        };
    }, [queryClient, replaceUser, toast, t]);

    return null;
}
