import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { paths } from '@/shared/lib/api/schema';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { AccessInput, AccountAccess } from '../types';

type AccessParams = paths['/platform/accounts/{id}/access']['post']['parameters'];

/** O documento da API ainda não declara o parâmetro `id` desta rota (falta `@ApiParam`): o tipo gerado o chama de `never`. */
function pathOf(id: string): AccessParams {
    return { path: { id } } as unknown as AccessParams;
}

export interface OpenAccountVariables {
    readonly id: string;
    readonly input: AccessInput;
}

export function useOpenAccount(): UseMutationResult<AccountAccess, ApiError, OpenAccountVariables> {
    return useMutation({
        mutationFn: async ({ id, input }: OpenAccountVariables): Promise<AccountAccess> =>
            unwrap<AccountAccess>(await apiClient.POST('/platform/accounts/{id}/access', { params: pathOf(id), body: input }))
    });
}
