import type { ReactElement } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { shortenItemId, type ParsedItemIds } from '../lib/parse-item-ids';
import { ITEM_ID_LIMIT } from '../types';

export interface ItemIdsFieldProps {
    readonly registration: UseFormRegisterReturn<'itemIds'>;
    readonly parsed: ParsedItemIds;
    readonly error: string | undefined;
}

const CHIP_CLASS: string = 'rounded-control border px-2 py-0.5 font-mono text-xs';

function Chips({ parsed }: { readonly parsed: ParsedItemIds }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    if (parsed.valid.length + parsed.invalid.length === 0) {
        return null;
    }
    return (
        <ul aria-label={t('credentials.chipsLabel')} className="flex flex-wrap gap-1.5">
            {parsed.valid.map((id: string): ReactElement => (
                <li key={id} className={cn(CHIP_CLASS, 'border-border bg-surface-muted text-content')}>
                    {t('credentials.chipValid', { id: shortenItemId(id) })}
                </li>
            ))}
            {parsed.invalid.map((id: string): ReactElement => (
                <li key={id} className={cn(CHIP_CLASS, 'border-critical/40 bg-critical/10 text-critical')}>
                    {t('credentials.chipInvalid', { id: shortenItemId(id) })}
                </li>
            ))}
        </ul>
    );
}

export function ItemIdsField({ registration, parsed, error }: ItemIdsFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const errorId: string = 'item-ids-error';
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="item-ids" className="text-sm font-medium text-content">
                {t('credentials.itemIds')}
            </label>
            <textarea
                id="item-ids"
                rows={3}
                autoComplete="off"
                spellCheck={false}
                placeholder={t('credentials.itemIdsPlaceholder')}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={cn(
                    'w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-content placeholder:text-content-subtle',
                    'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
                    error && 'border-critical focus:border-critical focus:ring-critical/20'
                )}
                {...registration}
            />
            <Chips parsed={parsed} />
            {error ? (
                <p id={errorId} role="alert" className="text-2xs text-critical">
                    {error}
                </p>
            ) : (
                <p className="text-2xs text-content-subtle">{t('credentials.itemIdsHint', { max: ITEM_ID_LIMIT })}</p>
            )}
        </div>
    );
}
