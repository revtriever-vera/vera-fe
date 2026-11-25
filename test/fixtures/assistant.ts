import type { AssistantUsage, ConversationView, MessageView, TurnView } from '@/features/assistant/types';

export function assistantUsage(overrides: Partial<AssistantUsage> = {}): AssistantUsage {
    return { state: 'ok', usedBps: 1000, resetsAt: '2026-12-01T03:00:00.000Z', ...overrides };
}

export function assistantMessage(overrides: Partial<MessageView> = {}): MessageView {
    return {
        id: 'message-1',
        role: 'vera',
        text: 'Resposta',
        status: 'done',
        toolsUsed: ['help_search'],
        notice: null,
        createdAt: '2026-11-25T12:00:00.000Z',
        ...overrides
    };
}

export function emptyConversation(overrides: Partial<ConversationView> = {}): ConversationView {
    return { conversationId: null, messages: [], usage: assistantUsage(), enabled: true, ...overrides };
}

export function conversationWith(messages: MessageView[], overrides: Partial<ConversationView> = {}): ConversationView {
    return { conversationId: 'conversation-1', messages, usage: assistantUsage(), enabled: true, ...overrides };
}

export function pendingTurn(overrides: Partial<TurnView> = {}): TurnView {
    return { status: 'pending', usage: assistantUsage(), ...overrides };
}
