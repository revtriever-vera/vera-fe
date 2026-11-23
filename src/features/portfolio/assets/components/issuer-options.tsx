import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { env } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';
import type { IssuerItem, IssuerSearchResponse } from '../types';

export function issuerOptionId(listId: string, item: IssuerItem): string {
    return `${listId}-${item.id}`;
}

interface OptionProps {
    readonly listId: string;
    readonly item: IssuerItem;
    readonly active: boolean;
    readonly onPick: (item: IssuerItem) => void;
}

function useScrollIntoView(ref: RefObject<HTMLElement | null>, active: boolean): void {
    useEffect((): void => {
        if (active) {
            ref.current?.scrollIntoView({ block: 'nearest' });
        }
    }, [ref, active]);
}

function Option({ listId, item, active, onPick }: OptionProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const ref: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);
    useScrollIntoView(ref, active);
    return (
        <button
            ref={ref}
            type="button"
            role="option"
            id={issuerOptionId(listId, item)}
            tabIndex={-1}
            aria-selected={active}
            onMouseDown={(event): void => {
                event.preventDefault();
            }}
            onClick={(): void => {
                onPick(item);
            }}
            className={cn(
                'flex w-full min-w-0 flex-col rounded-control px-2.5 py-2 text-left text-sm text-content',
                active ? 'bg-surface-muted' : 'hover:bg-surface-muted'
            )}
        >
            <span className="truncate">{item.name}</span>
            <span className="truncate text-xs text-content-muted">{t('fixedIncome.issuer.groupShort', { group: item.groupName })}</span>
        </button>
    );
}

function EmptyNote(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <p className="px-2.5 py-2 text-sm text-content-muted">
            {t('fixedIncome.issuer.empty')}{' '}
            {env.VITE_REPO_URL === '' ? null : (
                <a href={env.VITE_REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-accent-strong underline">
                    {t('fixedIncome.issuer.listLink')}
                </a>
            )}
        </p>
    );
}

export interface IssuerOptionsProps {
    readonly listId: string;
    readonly items: readonly IssuerItem[];
    readonly active: number;
    readonly search: UseQueryResult<IssuerSearchResponse>;
    readonly searched: boolean;
    readonly onPick: (item: IssuerItem) => void;
}

function Status({
    search,
    searched,
    count
}: Pick<IssuerOptionsProps, 'search' | 'searched'> & { readonly count: number }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    if (search.isError) {
        return <p className="px-2.5 py-2 text-sm text-content-muted">{t('fixedIncome.issuer.failed')}</p>;
    }
    if (search.data === undefined) {
        return <p className="px-2.5 py-2 text-sm text-content-muted">{t('fixedIncome.issuer.loading')}</p>;
    }
    return searched && count === 0 ? <EmptyNote /> : null;
}

export function IssuerOptions({ listId, items, active, search, searched, onPick }: IssuerOptionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <div className="surface-card flex flex-col gap-1 p-1">
            <div
                id={listId}
                role="listbox"
                aria-label={t('fixedIncome.issuer.listLabel')}
                aria-busy={search.isFetching}
                className="flex max-h-56 flex-col overflow-y-auto"
            >
                {items.map((item: IssuerItem, index: number): ReactElement => (
                    <Option key={item.id} listId={listId} item={item} active={index === active} onPick={onPick} />
                ))}
            </div>
            <Status search={search} searched={searched} count={items.length} />
        </div>
    );
}
