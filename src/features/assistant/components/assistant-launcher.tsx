import type { UseQueryResult } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { MessageCircleQuestion } from 'lucide-react';
import { useRef, useState, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { ConversationView } from '../types';
import { useConversation } from '../api/use-conversation.query';
import { AssistantPanel } from './assistant-panel';

export function AssistantLauncher(): ReactElement | null {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const path: string = useRouterState({ select: (state): string => state.location.pathname });
    const [open, setOpen] = useState<boolean>(false);
    const button: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement | null>(null);
    const conversation: UseQueryResult<ConversationView> = useConversation(true);
    if (!open && (conversation.isPending || conversation.data?.enabled === false)) {
        return null;
    }
    return (
        <>
            <button
                ref={button}
                type="button"
                aria-expanded={open}
                onClick={(): void => {
                    setOpen(true);
                }}
                className="fixed right-4 bottom-4 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-accent-strong px-4 text-sm font-semibold text-accent-contrast shadow-popover transition-opacity hover:opacity-90"
            >
                <MessageCircleQuestion className="size-4" aria-hidden="true" />
                {t('launcher.label')}
            </button>
            {open ? (
                <AssistantPanel
                    path={path}
                    onClose={(): void => {
                        setOpen(false);
                        button.current?.focus();
                    }}
                />
            ) : null}
        </>
    );
}
