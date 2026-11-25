import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { capResetsAt, assistantErrorMessage } from '../lib/assistant-error-message';
import type { AssistantChat } from '../lib/use-assistant-chat';
import { AssistantMessages } from './assistant-messages';
import { AssistantSuggestions } from './assistant-suggestions';
import { useLocale } from '@/shared/lib/i18n';
import { formatDayMonth } from '@/shared/lib/billing/billing-dates';
import type { SupportedLocale } from '@/shared/lib/locale';

export interface AssistantBodyProps {
    readonly chat: AssistantChat;
    readonly path: string;
}

function SendFailure({ error }: { readonly error: Error }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const locale: SupportedLocale = useLocale();
    const resetsAt: string | null = capResetsAt(error);
    const date: string | null = resetsAt === null ? null : formatDayMonth(resetsAt, locale);
    return <Alert tone="critical" title={assistantErrorMessage(t, error, date)} />;
}

function LoadFailure({ onRetry }: { readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <Alert
            tone="critical"
            title={t('panel.loadFailed')}
            action={
                <Button variant="ghost" size="sm" onClick={onRetry}>
                    {t('panel.retry')}
                </Button>
            }
        />
    );
}

export function AssistantBody({ chat, path }: AssistantBodyProps): ReactElement {
    if (chat.conversation.isPending) {
        return <Skeleton className="h-16 w-full" />;
    }
    if (chat.conversation.isError) {
        return (
            <LoadFailure
                onRetry={(): void => {
                    void chat.conversation.refetch();
                }}
            />
        );
    }
    return (
        <div className="flex flex-col gap-4">
            {chat.messages.length === 0 ? (
                <AssistantSuggestions path={path} disabled={chat.busy} onPick={chat.send} />
            ) : (
                <AssistantMessages messages={chat.messages} onRetry={chat.send} />
            )}
            {chat.sendError === null ? null : <SendFailure error={chat.sendError} />}
        </div>
    );
}
