import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ApiError } from '@/shared/lib/api/api-error';
import { MODEL_CONSENT_REQUIRED } from '@/shared/lib/investment-import-files';
import { useSendTurn, type SendTurnVariables } from '../api/use-send-turn.mutation';
import { useConversation } from '../api/use-conversation.query';
import { useTurn } from '../api/use-turn.query';
import { TURN_STATUS, type AssistantUsage, type ConversationView, type MessageView, type SendDraft, type TurnStarted } from '../types';

export interface AssistantChat {
    readonly conversation: UseQueryResult<ConversationView>;
    readonly messages: readonly MessageView[];
    readonly usage: AssistantUsage | null;
    readonly busy: boolean;
    readonly sendError: Error | null;
    readonly askingConsent: boolean;
    readonly send: (text: string, file?: File | null) => void;
    readonly sendToModel: () => void;
    readonly declineModel: () => void;
}

const NO_MESSAGES: readonly MessageView[] = [];

function pendingTurnId(messages: readonly MessageView[]): string | null {
    return messages.find((message: MessageView): boolean => message.role === 'vera' && message.status === TURN_STATUS.pending)?.id ?? null;
}

function needsConsent(error: Error): boolean {
    return error instanceof ApiError && error.problem.type === MODEL_CONSENT_REQUIRED;
}

interface Consent {
    readonly asking: boolean;
    readonly ask: (draft: SendDraft) => void;
    readonly take: () => SendDraft | null;
    readonly clear: () => void;
}

function useConsent(): Consent {
    const [draft, setDraft] = useState<SendDraft | null>(null);
    return {
        asking: draft !== null,
        ask: setDraft,
        take: (): SendDraft | null => {
            setDraft(null);
            return draft;
        },
        clear: (): void => {
            setDraft(null);
        }
    };
}

interface Runner {
    readonly pending: boolean;
    readonly error: Error | null;
    readonly send: (text: string, file?: File | null) => void;
    readonly sendToModel: () => void;
}

function useRunner(path: string, conversationId: string | null, consent: Consent): Runner {
    const sendTurn: UseMutationResult<TurnStarted, Error, SendTurnVariables> = useSendTurn();
    const { mutate, reset } = sendTurn;
    const { ask } = consent;
    const run: (draft: SendDraft, modelConsent: boolean) => void = useCallback(
        (draft: SendDraft, modelConsent: boolean): void => {
            mutate(
                { text: draft.text, file: draft.file, path, conversationId, modelConsent },
                {
                    onError: (error: Error): void => {
                        if (!modelConsent && needsConsent(error)) {
                            reset();
                            ask(draft);
                        }
                    }
                }
            );
        },
        [mutate, reset, ask, conversationId, path]
    );
    return {
        pending: sendTurn.isPending,
        error: sendTurn.error,
        send: (text: string, file: File | null = null): void => {
            run({ text, file }, false);
        },
        sendToModel: (): void => {
            const draft: SendDraft | null = consent.take();
            if (draft !== null) {
                run(draft, true);
            }
        }
    };
}

export function useAssistantChat(path: string): AssistantChat {
    const conversation: UseQueryResult<ConversationView> = useConversation(true);
    const consent: Consent = useConsent();
    const messages: readonly MessageView[] = conversation.data?.messages ?? NO_MESSAGES;
    const pendingId: string | null = pendingTurnId(messages);
    useTurn(pendingId);
    const runner: Runner = useRunner(path, conversation.data?.conversationId ?? null, consent);
    return {
        conversation,
        messages,
        usage: conversation.data?.usage ?? null,
        busy: runner.pending || pendingId !== null,
        sendError: runner.error,
        askingConsent: consent.asking,
        send: runner.send,
        sendToModel: runner.sendToModel,
        declineModel: consent.clear
    };
}
