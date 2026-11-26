import { Maximize2, Minimize2, Trash2, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { cn } from '@/shared/lib/cn';
import { useAssistantChat, type AssistantChat } from '../lib/use-assistant-chat';
import { AssistantBody } from './assistant-body';
import { AssistantComposer } from './assistant-composer';
import { AssistantModelConsent } from './assistant-model-consent';
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

function sectionClass(variant: AssistantPanelVariant): string {
    return cn('fixed z-40 flex flex-col border-border bg-surface shadow-popover', VARIANT_CLASS[variant]);
}

interface HeaderProps {
    readonly titleId: string;
    readonly canDelete: boolean;
    readonly expanded: boolean;
    readonly onToggleExpanded: () => void;
    readonly onDelete: () => void;
    readonly onClose: () => void;
}

function ExpandButton({ expanded, onToggle }: { readonly expanded: boolean; readonly onToggle: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const Icon: typeof Maximize2 = expanded ? Minimize2 : Maximize2;
    const label: string = expanded ? t('panel.collapse') : t('panel.expand');
    return (
        <button type="button" aria-label={label} title={label} onClick={onToggle} className={cn(ICON_BUTTON, 'max-sm:hidden')}>
            <Icon className="size-4" aria-hidden="true" />
        </button>
    );
}

function PanelHeader({ titleId, canDelete, expanded, onToggleExpanded, onDelete, onClose }: HeaderProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 id={titleId} className="m-0 text-base font-semibold text-content">
                {t('panel.title')}
            </h2>
            <div className="flex items-center gap-1">
                <ExpandButton expanded={expanded} onToggle={onToggleExpanded} />
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

interface PanelContentProps {
    readonly chat: AssistantChat;
    readonly path: string;
    readonly expanded: boolean;
    readonly input: RefObject<HTMLTextAreaElement | null>;
}

function PanelContent({ chat, path, expanded, input }: PanelContentProps): ReactElement {
    const { canEdit }: { canEdit: boolean } = useRole();
    const column: string = cn('mx-auto w-full', expanded && 'max-w-4xl');
    return (
        <>
            <div className="flex-1 overflow-y-auto p-4">
                <div className={column}>
                    <AssistantBody chat={chat} path={path} />
                </div>
            </div>
            <AssistantQuota usage={chat.usage} />
            <div className="border-t border-border">
                <div className={column}>
                    <AssistantComposer inputRef={input} usage={chat.usage} busy={chat.busy} canAttach={canEdit} onSend={chat.send} />
                </div>
            </div>
        </>
    );
}

interface DialogsProps {
    readonly chat: AssistantChat;
    readonly deletingId: string | null;
    readonly onStopDeleting: () => void;
}

function PanelDialogs({ chat, deletingId, onStopDeleting }: DialogsProps): ReactElement {
    return (
        <>
            {chat.askingConsent ? <AssistantModelConsent onSend={chat.sendToModel} onCancel={chat.declineModel} /> : null}
            {deletingId === null ? null : <DeleteConversationDialog conversationId={deletingId} onClose={onStopDeleting} />}
        </>
    );
}

export function AssistantPanel({ path, onClose, variant = 'side' }: AssistantPanelProps): ReactElement {
    const titleId: string = useId();
    const [expanded, setExpanded] = useState<boolean>(variant === 'full');
    const chat: AssistantChat = useAssistantChat(path);
    const input: RefObject<HTMLTextAreaElement | null> = useFocusOnOpen();
    const [deleting, setDeleting] = useState<boolean>(false);
    useEscape(onClose, !deleting && !chat.askingConsent);
    const conversationId: string | null = chat.conversation.data?.conversationId ?? null;
    return (
        <>
            <section aria-labelledby={titleId} className={sectionClass(expanded ? 'full' : variant)}>
                <PanelHeader
                    titleId={titleId}
                    canDelete={conversationId !== null && chat.messages.length > 0}
                    expanded={expanded}
                    onToggleExpanded={(): void => {
                        setExpanded((current: boolean): boolean => !current);
                    }}
                    onDelete={(): void => {
                        setDeleting(true);
                    }}
                    onClose={onClose}
                />
                <PanelContent chat={chat} path={path} expanded={expanded} input={input} />
            </section>
            <PanelDialogs
                chat={chat}
                deletingId={deleting ? conversationId : null}
                onStopDeleting={(): void => {
                    setDeleting(false);
                }}
            />
        </>
    );
}
