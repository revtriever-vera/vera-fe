import { SendHorizontal } from 'lucide-react';
import { useId, useState, type KeyboardEvent, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDayMonth } from '@/shared/lib/billing/billing-dates';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { MAX_TURN_LENGTH, type AssistantUsage } from '../types';

export interface AssistantComposerProps {
    readonly inputRef: RefObject<HTMLTextAreaElement | null>;
    readonly usage: AssistantUsage | null;
    readonly busy: boolean;
    readonly onSend: (text: string) => void;
}

function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>, submit: () => void): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        submit();
    }
}

function PausedNote({ usage }: { readonly usage: AssistantUsage }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const locale: SupportedLocale = useLocale();
    return (
        <p className="m-0 rounded-control bg-surface-muted px-3 py-2 text-sm text-content">
            {t('composer.paused', { date: formatDayMonth(usage.resetsAt, locale) })}
        </p>
    );
}

function Disclosure({ id }: { readonly id: string }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <p id={id} className="m-0 text-2xs text-content-subtle">
            {t('composer.disclosure')}
        </p>
    );
}

interface ComposerState {
    readonly text: string;
    readonly canSend: boolean;
    readonly setText: (text: string) => void;
    readonly submit: () => void;
}

function useComposerState(paused: boolean, busy: boolean, onSend: (text: string) => void): ComposerState {
    const [text, setText] = useState<string>('');
    const canSend: boolean = !paused && !busy && text.trim() !== '';
    const submit = (): void => {
        if (canSend) {
            onSend(text.trim());
            setText('');
        }
    };
    return { text, canSend, setText, submit };
}

interface FieldProps {
    readonly id: string;
    readonly noteId: string;
    readonly inputRef: RefObject<HTMLTextAreaElement | null>;
    readonly paused: boolean;
    readonly state: ComposerState;
}

function ComposerField({ id, noteId, inputRef, paused, state }: FieldProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <div className="flex items-end gap-2">
            <textarea
                id={id}
                ref={inputRef}
                rows={2}
                value={state.text}
                maxLength={MAX_TURN_LENGTH}
                disabled={paused}
                placeholder={t('composer.placeholder')}
                aria-describedby={noteId}
                onChange={(event): void => {
                    state.setText(event.target.value);
                }}
                onKeyDown={(event): void => {
                    submitOnEnter(event, state.submit);
                }}
                className="min-h-14 flex-1 resize-none rounded-control border border-border bg-surface px-3 py-2 text-sm text-content disabled:opacity-50"
            />
            <Button type="submit" disabled={!state.canSend} aria-label={t('composer.send')}>
                <SendHorizontal className="size-4" aria-hidden="true" />
            </Button>
        </div>
    );
}

export function AssistantComposer({ inputRef, usage, busy, onSend }: AssistantComposerProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const fieldId: string = useId();
    const noteId: string = useId();
    const paused: boolean = usage?.state === 'paused';
    const state: ComposerState = useComposerState(paused, busy, onSend);
    return (
        <form
            className="flex flex-col gap-2 border-t border-border p-3"
            onSubmit={(event): void => {
                event.preventDefault();
                state.submit();
            }}
        >
            {usage !== null && paused ? <PausedNote usage={usage} /> : null}
            <label htmlFor={fieldId} className="sr-only">
                {t('composer.label')}
            </label>
            <ComposerField id={fieldId} noteId={noteId} inputRef={inputRef} paused={paused} state={state} />
            <Disclosure id={noteId} />
        </form>
    );
}
