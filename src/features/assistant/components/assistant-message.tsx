import type { UseMutationResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { useTurnFeedback } from '../api/use-turn-feedback.mutation';
import { TURN_STATUS, type MessageView } from '../types';
import { AnswerText } from './answer-text';
import { AssistantUpgrade } from './assistant-upgrade';
import { SeeSent } from './assistant-sent';

export interface AssistantMessageProps {
    readonly message: MessageView;
    readonly onRetry: () => void;
}

function PendingLine(): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return <p className="m-0 text-content-muted motion-safe:animate-pulse">{t('message.pending')}</p>;
}

function FailedLine({ onRetry }: { readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <div className="flex flex-col items-start gap-2">
            <p className="m-0 text-critical">{t('message.failed')}</p>
            <Button variant="secondary" size="sm" onClick={onRetry}>
                {t('message.retry')}
            </Button>
        </div>
    );
}

function Feedback({ id }: { readonly id: string }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const feedback: UseMutationResult<void, Error, string> = useTurnFeedback();
    if (feedback.isSuccess) {
        return <p className="m-0 text-xs text-content-subtle">{t('message.unhelpfulDone')}</p>;
    }
    return (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 self-start"
            disabled={feedback.isPending}
            onClick={(): void => {
                feedback.mutate(id);
            }}
        >
            {t('message.unhelpful')}
        </Button>
    );
}

function Answer({ message }: { readonly message: MessageView }): ReactElement {
    return (
        <>
            <AnswerText text={message.text} />
            {message.notice === null ? null : <p className="m-0 text-xs text-content-subtle italic">{message.notice}</p>}
            {message.sentAvailable ? <SeeSent id={message.id} /> : null}
            {message.access === 'ok' ? null : <AssistantUpgrade access={message.access} />}
            <Feedback id={message.id} />
        </>
    );
}

function VeraBody({ message, onRetry }: AssistantMessageProps): ReactElement {
    if (message.status === TURN_STATUS.pending) {
        return <PendingLine />;
    }
    return message.status === TURN_STATUS.failed ? <FailedLine onRetry={onRetry} /> : <Answer message={message} />;
}

export function AssistantMessage({ message, onRetry }: AssistantMessageProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const fromPerson: boolean = message.role === 'person';
    return (
        <li className={cn('flex flex-col gap-1', fromPerson && 'items-end')}>
            <span className="text-2xs font-semibold text-content-subtle">{fromPerson ? t('message.person') : t('message.vera')}</span>
            <div
                className={cn(
                    'flex max-w-[90%] flex-col gap-2 rounded-card px-3 py-2 text-sm',
                    fromPerson ? 'bg-accent-strong text-accent-contrast' : 'bg-surface-muted text-content'
                )}
            >
                {fromPerson ? <p className="m-0 whitespace-pre-line">{message.text}</p> : <VeraBody message={message} onRetry={onRetry} />}
            </div>
        </li>
    );
}
