import type { paths } from '@/shared/lib/api/schema';

export const TURN_STATUS: { readonly pending: 'pending'; readonly done: 'done'; readonly failed: 'failed' } = {
    pending: 'pending',
    done: 'done',
    failed: 'failed'
};

export type TurnStatus = 'pending' | 'done' | 'failed';
export type MessageRole = 'person' | 'vera';

type Json<T> = T extends { readonly content: { readonly 'application/json': infer B } } ? B : never;
type Ok<Path extends keyof paths, Method extends keyof paths[Path], Status extends number> = paths[Path][Method] extends {
    readonly responses: infer R;
}
    ? Status extends keyof R
        ? Json<R[Status]>
        : never
    : never;

export type TurnStarted = Ok<'/assistant/turns', 'post', 202>;
export type TurnView = Ok<'/assistant/turns/{id}', 'get', 200>;
export type ConversationView = Ok<'/assistant/conversations/current', 'get', 200>;
export type MessageView = ConversationView['messages'][number];
export type AssistantUsage = TurnView['usage'];
export type AssistantUsageState = AssistantUsage['state'];
export type SendTurnInput = Json<NonNullable<paths['/assistant/turns']['post']['requestBody']>>;

export const MAX_TURN_LENGTH: number = 1000;
