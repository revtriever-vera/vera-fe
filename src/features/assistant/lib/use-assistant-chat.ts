import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSendTurn } from '../api/use-send-turn.mutation';
import { useConversation } from '../api/use-conversation.query';
import { useTurn } from '../api/use-turn.query';
import { TURN_STATUS, type AssistantUsage, type ConversationView, type MessageView, type SendTurnInput, type TurnStarted } from '../types';

export interface AssistantChat {
    readonly conversation: UseQueryResult<ConversationView>;
    readonly messages: readonly MessageView[];
    readonly usage: AssistantUsage | null;
    readonly busy: boolean;
    readonly sendError: Error | null;
    readonly send: (text: string) => void;
}

const NO_MESSAGES: readonly MessageView[] = [];

function pendingTurnId(messages: readonly MessageView[]): string | null {
    return messages.find((message: MessageView): boolean => message.role === 'vera' && message.status === TURN_STATUS.pending)?.id ?? null;
}

export function useAssistantChat(path: string): AssistantChat {
    const conversation: UseQueryResult<ConversationView> = useConversation(true);
    const sendTurn: UseMutationResult<TurnStarted, Error, SendTurnInput> = useSendTurn();
    const messages: readonly MessageView[] = conversation.data?.messages ?? NO_MESSAGES;
    const pendingId: string | null = pendingTurnId(messages);
    useTurn(pendingId);
    const conversationId: string | null = conversation.data?.conversationId ?? null;
    const { mutate } = sendTurn;
    const send: (text: string) => void = useCallback(
        (text: string): void => {
            mutate({ ...(conversationId === null ? {} : { conversationId }), text, screen: { path } });
        },
        [mutate, conversationId, path]
    );
    return {
        conversation,
        messages,
        usage: conversation.data?.usage ?? null,
        busy: sendTurn.isPending || pendingId !== null,
        sendError: sendTurn.error,
        send
    };
}
