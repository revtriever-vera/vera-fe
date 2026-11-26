import type {
    ActionCandidate,
    ActionSummary,
    ActionView,
    AssistantUsage,
    ConversationView,
    MessageView,
    TurnView
} from '@/features/assistant/types';

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
        access: 'ok',
        sentAvailable: false,
        notice: null,
        action: null,
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

export function actionSummary(overrides: Partial<ActionSummary> = {}): ActionSummary {
    return {
        id: 'action-1',
        tool: 'goal_create',
        summary: 'Criar o objetivo viagem: R$ 12.000 até dezembro de 2027.',
        status: 'open',
        expiresAt: '2026-11-25T12:30:00.000Z',
        resultText: null,
        reference: null,
        ...overrides
    };
}

export function actionCandidate(overrides: Partial<ActionCandidate> = {}): ActionCandidate {
    return {
        id: 'tx-1',
        version: '2026-11-20T10:00:00.000Z',
        date: '2026-11-20',
        description: 'NETFLIX.COM',
        amountMinor: -3990,
        currency: 'BRL',
        accountName: 'Conta corrente',
        ...overrides
    };
}

export function actionView(overrides: Partial<ActionView> = {}): ActionView {
    return { ...actionSummary(), candidates: [], importPreview: null, always: null, ...overrides };
}
