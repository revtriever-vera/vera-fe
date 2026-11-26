import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiPaths } from '@/shared/lib/api/api-paths';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { buildTurnFormData } from '../lib/build-turn-form-data';
import type { TurnStarted } from '../types';
import { assistantKeys } from './assistant-keys';

type TurnBody = ApiPaths['/assistant/turns']['post']['requestBody']['content']['multipart/form-data'];

export interface SendTurnVariables {
    readonly text: string;
    readonly path: string;
    readonly conversationId: string | null;
    readonly file: File | null;
    readonly modelConsent: boolean;
}

async function post(variables: SendTurnVariables): Promise<TurnStarted> {
    const { file, text, path, conversationId, modelConsent } = variables;
    if (file !== null) {
        const form: FormData = buildTurnFormData({ file, text, path, conversationId, modelConsent });
        return unwrap(await apiClient.POST('/assistant/turns', { body: form as unknown as TurnBody }));
    }
    return unwrap(
        await apiClient.POST('/assistant/turns', {
            body: { ...(conversationId === null ? {} : { conversationId }), text, screen: { path } }
        })
    );
}

export function useSendTurn(): UseMutationResult<TurnStarted, Error, SendTurnVariables> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: post,
        onSettled: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: assistantKeys.conversation() });
        }
    });
}
