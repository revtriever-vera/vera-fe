import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { SearchInput } from '@/shared/ui/search-input';
import { useIssuerSearch } from '../api/use-issuer-search.query';
import { issuerKindFor } from '../lib/issuer-kind';
import type { FixedIncomeKind, IssuerItem, IssuerSearchResponse, TitleIssuer } from '../types';
import { ErrorLine } from './error-line';
import { IssuerOptions, issuerOptionId } from './issuer-options';

const SEARCH_DEBOUNCE_MS: number = 250;
const ARROW_STEPS: Readonly<Record<string, number>> = { ArrowDown: 1, ArrowUp: -1 };

export interface IssuerFieldProps {
    readonly kind: FixedIncomeKind;
    readonly value: TitleIssuer | null;
    readonly error: string | undefined;
    readonly focusOnMount?: boolean;
    readonly onChange: (issuer: TitleIssuer | null) => void;
}

function toChoice(item: IssuerItem): TitleIssuer {
    return {
        id: item.id,
        name: item.name,
        groupId: item.groupId,
        groupName: item.groupName,
        kind: item.kind,
        fgcAssociated: item.fgcAssociated
    };
}

function useFocusOnMount(container: RefObject<HTMLDivElement | null>, enabled: boolean): void {
    useEffect((): void => {
        if (enabled) {
            container.current?.querySelector<HTMLInputElement>('input')?.focus();
        }
    }, [container, enabled]);
}

interface Results {
    readonly items: readonly IssuerItem[];
    readonly search: UseQueryResult<IssuerSearchResponse>;
    readonly searched: boolean;
}

function useResults(kind: FixedIncomeKind, query: string): Results {
    const debounced: string = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
    const search: UseQueryResult<IssuerSearchResponse> = useIssuerSearch({ kind: issuerKindFor(kind), q: debounced });
    return { items: search.data?.items ?? [], search, searched: debounced !== '' };
}

interface ListState {
    readonly open: boolean;
    readonly active: number;
    readonly show: () => void;
    readonly hide: () => void;
    readonly restart: () => void;
    readonly move: (step: number, count: number) => void;
}

function useListState(): ListState {
    const [open, setOpen] = useState<boolean>(false);
    const [active, setActive] = useState<number>(0);
    return {
        open,
        active,
        show: (): void => {
            setOpen(true);
        },
        hide: (): void => {
            setOpen(false);
        },
        restart: (): void => {
            setActive(0);
            setOpen(true);
        },
        move: (step: number, count: number): void => {
            setOpen(true);
            setActive(Math.min(Math.max(active + step, 0), Math.max(count - 1, 0)));
        }
    };
}

function keyHandler(
    list: ListState,
    items: readonly IssuerItem[],
    pick: (item: IssuerItem) => void
): (event: KeyboardEvent<HTMLElement>) => void {
    return (event: KeyboardEvent<HTMLElement>): void => {
        const step: number = ARROW_STEPS[event.key] ?? 0;
        const chosen: IssuerItem | undefined = items[list.active];
        if (step !== 0) {
            event.preventDefault();
            list.move(step, items.length);
        }
        if (event.key === 'Enter' && list.open && chosen !== undefined) {
            event.preventDefault();
            pick(chosen);
        }
        if (event.key === 'Escape' && list.open) {
            event.stopPropagation();
            list.hide();
        }
    };
}

function SupportLine({ issuer }: { readonly issuer: TitleIssuer }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return <p className="text-xs text-content-muted">{t('fixedIncome.issuer.group', { issuer: issuer.name, group: issuer.groupName })}</p>;
}

function activeOptionId(listId: string, items: readonly IssuerItem[], active: number): string | undefined {
    const item: IssuerItem | undefined = items[active];
    return item === undefined ? undefined : issuerOptionId(listId, item);
}

interface Picker {
    readonly query: string;
    readonly results: Results;
    readonly list: ListState;
    readonly pick: (item: IssuerItem) => void;
    readonly type: (text: string) => void;
}

function usePicker({ kind, onChange }: Pick<IssuerFieldProps, 'kind' | 'onChange'>): Picker {
    const [query, setQuery] = useState<string>('');
    const results: Results = useResults(kind, query);
    const list: ListState = useListState();
    return {
        query,
        results,
        list,
        pick: (item: IssuerItem): void => {
            onChange(toChoice(item));
            setQuery('');
            list.hide();
        },
        type: (text: string): void => {
            onChange(null);
            setQuery(text);
            list.restart();
        }
    };
}

function closeOnLeave(list: ListState): (event: FocusEvent<HTMLDivElement>) => void {
    return (event: FocusEvent<HTMLDivElement>): void => {
        if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
            list.hide();
        }
    };
}

export function IssuerField({ kind, value, error, focusOnMount = false, onChange }: IssuerFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const container: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
    const listId: string = useId();
    const { query, results, list, pick, type }: Picker = usePicker({ kind, onChange });
    const showList: boolean = list.open && value === null;
    useFocusOnMount(container, focusOnMount);
    return (
        // eslint-disable-next-line sonar/S6819 -- keyboard delegation wrapper for the combobox, not an image
        <div
            ref={container}
            className="flex flex-col gap-1.5"
            role="presentation"
            onKeyDown={keyHandler(list, results.items, pick)}
            onFocus={list.show}
            onBlur={closeOnLeave(list)}
        >
            <span className="text-sm font-medium text-content">{t('fixedIncome.issuer.label')}</span>
            <SearchInput
                value={value === null ? query : value.name}
                onChange={type}
                placeholder={t('fixedIncome.issuer.placeholder')}
                label={t('fixedIncome.issuer.label')}
                combobox={{
                    listId,
                    expanded: showList,
                    activeId: showList ? activeOptionId(listId, results.items, list.active) : undefined
                }}
            />
            {value === null ? null : <SupportLine issuer={value} />}
            {showList ? <IssuerOptions listId={listId} active={list.active} {...results} onPick={pick} /> : null}
            <ErrorLine message={error} />
        </div>
    );
}
