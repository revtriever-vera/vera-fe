import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Loading, SkeletonText } from '@/shared/ui/skeleton';
import { useTurnSent } from '../api/use-turn-sent.query';
import { useAssistantSlots } from '../lib/use-assistant-slots';
import type { SentView } from '../types';

function SentBody({ id }: { readonly id: string }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const query: UseQueryResult<SentView> = useTurnSent(id);
    if (query.error !== null) {
        return <p className="m-0 text-sm text-critical">{t('sent.failed')}</p>;
    }
    if (query.data === undefined) {
        return (
            <Loading label={t('sent.loading')}>
                <SkeletonText lines={6} />
            </Loading>
        );
    }
    if (query.data.sent.length === 0) {
        return <p className="m-0 text-sm text-content-muted">{t('sent.empty')}</p>;
    }
    return (
        <pre className="max-h-[60vh] overflow-auto rounded-control border border-border bg-surface-muted p-3 font-mono text-xs leading-relaxed text-content">
            {JSON.stringify(query.data.sent, null, 2)}
        </pre>
    );
}

export function SeeSent({ id }: { readonly id: string }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const { SentFrame } = useAssistantSlots();
    const [open, setOpen] = useState<boolean>(false);
    return (
        <span className="text-xs">
            <button
                type="button"
                className="font-semibold text-accent-strong underline underline-offset-2"
                onClick={(): void => {
                    setOpen(true);
                }}
            >
                {t('sent.link')}
            </button>
            {open ? (
                <SentFrame
                    onClose={(): void => {
                        setOpen(false);
                    }}
                >
                    <SentBody id={id} />
                </SentFrame>
            ) : null}
        </span>
    );
}
