import type { Client } from 'openapi-fetch';
import { apiClient } from '@/shared/lib/api/client';
import type { ConversationView, SendTurnInput, TurnStarted, TurnView } from '../types';

interface Json<T> {
    readonly content: { readonly 'application/json': T };
}

interface Reply<T> {
    readonly headers: Record<string, unknown>;
    readonly content: { readonly 'application/json': T };
}

interface Empty {
    readonly headers: Record<string, unknown>;
    readonly content?: never;
}

interface NoParams {
    readonly query?: never;
    readonly header?: never;
    readonly path?: never;
    readonly cookie?: never;
}

interface IdParams {
    readonly query?: never;
    readonly header?: never;
    readonly path: { readonly id: string };
    readonly cookie?: never;
}

interface PathItem {
    readonly parameters: NoParams;
    readonly get?: never;
    readonly put?: never;
    readonly post?: never;
    readonly delete?: never;
    readonly options?: never;
    readonly head?: never;
    readonly patch?: never;
    readonly trace?: never;
}

export interface AssistantPaths {
    readonly '/assistant/turns': Omit<PathItem, 'post'> & {
        readonly post: {
            readonly parameters: NoParams;
            readonly requestBody: { readonly content: Json<SendTurnInput>['content'] };
            readonly responses: { readonly 202: Reply<TurnStarted> };
        };
    };
    readonly '/assistant/turns/{id}': Omit<PathItem, 'get' | 'parameters'> & {
        readonly parameters: IdParams;
        readonly get: {
            readonly parameters: IdParams;
            readonly requestBody?: never;
            readonly responses: { readonly 200: Reply<TurnView> };
        };
    };
    readonly '/assistant/turns/{id}/feedback': Omit<PathItem, 'post' | 'parameters'> & {
        readonly parameters: IdParams;
        readonly post: {
            readonly parameters: IdParams;
            readonly requestBody: { readonly content: Json<{ readonly helpful: false }>['content'] };
            readonly responses: { readonly 204: Empty };
        };
    };
    readonly '/assistant/conversations/current': Omit<PathItem, 'get'> & {
        readonly get: {
            readonly parameters: NoParams;
            readonly requestBody?: never;
            readonly responses: { readonly 200: Reply<ConversationView> };
        };
    };
    readonly '/assistant/conversations/{id}': Omit<PathItem, 'delete' | 'parameters'> & {
        readonly parameters: IdParams;
        readonly delete: { readonly parameters: IdParams; readonly requestBody?: never; readonly responses: { readonly 204: Empty } };
    };
}

export const assistantClient: Client<AssistantPaths> = apiClient as unknown as Client<AssistantPaths>;
