import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { MessageView } from '../types';
import { AssistantMessage } from './assistant-message';

export interface AssistantMessagesProps {
    readonly messages: readonly MessageView[];
    readonly onRetry: (text: string) => void;
}

export function AssistantMessages({ messages, onRetry }: AssistantMessagesProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const end: RefObject<HTMLLIElement | null> = useRef<HTMLLIElement | null>(null);
    useEffect((): void => {
        end.current?.scrollIntoView({ block: 'end' });
    }, [messages]);
    return (
        <ul role="log" aria-live="polite" aria-label={t('message.log')} className="m-0 flex list-none flex-col gap-4 p-0">
            {messages.map((message: MessageView, index: number): ReactElement => (
                <AssistantMessage
                    key={message.id}
                    message={message}
                    onRetry={(): void => {
                        onRetry(messages[index - 1]?.text ?? '');
                    }}
                />
            ))}
            <li ref={end} aria-hidden="true" />
        </ul>
    );
}
