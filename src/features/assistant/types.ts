export const TURN_STATUS: { readonly pending: 'pending'; readonly done: 'done'; readonly failed: 'failed' } = {
    pending: 'pending',
    done: 'done',
    failed: 'failed'
};

export type TurnStatus = 'pending' | 'done' | 'failed';
export type MessageRole = 'person' | 'vera';
export type AssistantUsageState = 'ok' | 'warning' | 'paused';

export interface AssistantUsage {
    readonly state: AssistantUsageState;
    readonly usedBps: number;
    readonly resetsAt: string;
}

export interface MessageView {
    readonly id: string;
    readonly role: MessageRole;
    readonly text: string;
    readonly status: TurnStatus;
    readonly toolsUsed: string[];
    readonly notice: string | null;
    readonly createdAt: string;
}

export interface ConversationView {
    readonly conversationId: string | null;
    readonly messages: MessageView[];
    readonly usage: AssistantUsage | null;
}

export interface TurnView {
    readonly status: TurnStatus;
    readonly answer?: {
        readonly text: string;
        readonly source: 'help' | 'ai';
        readonly toolsUsed: string[];
        readonly sentAvailable: boolean;
        readonly notice: string | null;
    };
    readonly usage: AssistantUsage;
}

export interface SendTurnInput {
    readonly conversationId?: string;
    readonly text: string;
    readonly screen: { readonly path: string };
}

export interface TurnStarted {
    readonly turnId: string;
    readonly conversationId: string;
}

export const MAX_TURN_LENGTH: number = 1000;
