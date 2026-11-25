import { Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { useAssistantChat, type AssistantChat } from '../lib/use-assistant-chat';
import { AssistantBody } from './assistant-body';
import { AssistantComposer } from './assistant-composer';
import { AssistantQuota } from './assistant-quota';
import { DeleteConversationDialog } from './delete-conversation-dialog';

export type AssistantPanelVariant = 'side' | 'full';

export interface AssistantPanelProps {
    readonly path: string;
    readonly onClose: () => void;
    readonly variant?: AssistantPanelVariant;
}

const VARIANT_CLASS: Readonly<Record<AssistantPanelVariant, string>> = {
    side: 'inset-0 sm:left-auto sm:w-[26rem] sm:border-l',
    full: 'inset-0'
};

const ICON_BUTTON: string =
    'inline-flex size-8 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:opacity-50';

interface HeaderProps {
    readonly titleId: string;
    readonly canDelete: boolean;
    readonly onDelete: () => void;
    readonly onClose: () => void;
}

function PanelHeader({ titleId, canDelete, onDelete, onClose }: HeaderProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 id={titleId} className="m-0 text-base font-semibold text-content">
                {t('panel.title')}
            </h2>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={!canDelete}
                    aria-label={t('panel.delete')}
                    title={t('panel.delete')}
                    onClick={onDelete}
                    className={ICON_BUTTON}
                >
                    <Trash2 className="size-4" aria-hidden="true" />
                </button>
                <button type="button" aria-label={t('panel.close')} onClick={onClose} className={ICON_BUTTON}>
                    <X className="size-4" aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}

function useEscape(onClose: () => void, active: boolean): void {
    useEffect((): (() => void) => {
        const onKey = (event: KeyboardEvent): void => {
            if (active && event.key === 'Escape' && !event.defaultPrevented) {
                onClose();
            }
        };
        window.addEventListener('keydown', onKey);
        return (): void => {
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose, active]);
}

function useFocusOnOpen(): RefObject<HTMLTextAreaElement | null> {
    const input: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement | null>(null);
    useEffect((): void => {
        input.current?.focus();
    }, []);
    return input;
}

export function AssistantPanel({ path, onClose, variant = 'side' }: AssistantPanelProps): ReactElement {
    const titleId: string = useId();
    const chat: AssistantChat = useAssistantChat(path);
    const input: RefObject<HTMLTextAreaElement | null> = useFocusOnOpen();
    const [deleting, setDeleting] = useState<boolean>(false);
    useEscape(onClose, !deleting);
    const conversationId: string | null = chat.conversation.data?.conversationId ?? null;
    return (
        <>
            <section
                aria-labelledby={titleId}
                className={cn('fixed z-40 flex flex-col border-border bg-surface shadow-popover', VARIANT_CLASS[variant])}
            >
                <PanelHeader
                    titleId={titleId}
                    canDelete={conversationId !== null && chat.messages.length > 0}
                    onDelete={(): void => {
                        setDeleting(true);
                    }}
                    onClose={onClose}
                />
                <div className="flex-1 overflow-y-auto p-4">
                    <AssistantBody chat={chat} path={path} />
                </div>
                <AssistantQuota usage={chat.usage} />
                <AssistantComposer inputRef={input} usage={chat.usage} busy={chat.busy} onSend={chat.send} />
            </section>
            {deleting && conversationId !== null ? (
                <DeleteConversationDialog
                    conversationId={conversationId}
                    onClose={(): void => {
                        setDeleting(false);
                    }}
                />
            ) : null}
        </>
    );
}
