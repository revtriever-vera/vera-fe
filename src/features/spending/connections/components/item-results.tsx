import type { ReactElement } from 'react';
import { CircleAlert, CircleCheck, CircleX, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import type { ItemOutcome, ItemResult } from '../types';

interface OutcomeStyle {
    readonly icon: LucideIcon;
    readonly tone: string;
}

const STYLES: Readonly<Record<ItemOutcome, OutcomeStyle>> = {
    connected: { icon: CircleCheck, tone: 'text-positive' },
    already_connected: { icon: CircleCheck, tone: 'text-content-muted' },
    not_found: { icon: CircleX, tone: 'text-critical' },
    limit_reached: { icon: CircleAlert, tone: 'text-caution' },
    failed: { icon: CircleAlert, tone: 'text-caution' }
};

function useResultMessage(): (result: ItemResult) => string {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (result: ItemResult): string => {
        const name: string | null = result.connection?.connectorName ?? null;
        switch (result.outcome) {
            case 'connected':
                return name === null ? t('credentials.results.connectedUnknown') : t('credentials.results.connected', { name });
            case 'already_connected':
                return name === null
                    ? t('credentials.results.alreadyConnectedUnknown')
                    : t('credentials.results.alreadyConnected', { name });
            case 'not_found':
                return t('credentials.results.notFound');
            case 'limit_reached':
                return t('credentials.results.limitReached');
            case 'failed':
                return t('credentials.results.failed');
        }
    };
}

export function ItemResults({ results }: { readonly results: readonly ItemResult[] }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const message: (result: ItemResult) => string = useResultMessage();
    return (
        <div aria-live="polite">
            {results.length === 0 ? null : (
                <section aria-label={t('credentials.results.title')} className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-content">{t('credentials.results.title')}</h3>
                    <ul className="flex flex-col gap-2">
                        {results.map((result: ItemResult, index: number): ReactElement => {
                            const Icon: LucideIcon = STYLES[result.outcome].icon;
                            return (
                                <li key={`${result.itemIdHint}-${String(index)}`} className="flex items-start gap-2 text-sm text-content">
                                    <Icon className={cn('mt-0.5 size-4 shrink-0', STYLES[result.outcome].tone)} aria-hidden="true" />
                                    <span>
                                        {message(result)}
                                        <span className="ml-2 font-mono text-xs text-content-subtle">
                                            {t('credentials.results.forItem', { hint: result.itemIdHint })}
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </div>
    );
}
