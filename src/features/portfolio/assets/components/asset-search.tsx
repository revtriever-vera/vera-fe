import { useEffect, useRef, type KeyboardEvent, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLocale } from '@/shared/lib/i18n';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { Alert } from '@/shared/ui/alert';
import { SearchInput } from '@/shared/ui/search-input';
import { Skeleton } from '@/shared/ui/skeleton';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { AssetClassView } from '../../types';
import { useCatalogSearch } from '../api/use-catalog-search.query';
import { useQuotes, type QuoteBook } from '../api/use-quotes.query';
import { colorKeyForClassKey } from '../lib/asset-types';
import { formatUnitPrice } from '../lib/format-unit-price';
import type { CatalogAsset, CatalogGroup, CatalogSearchResponse, Quote } from '../types';
import { AssetResultItem, type ResultPrice } from './asset-result-item';

const SEARCH_DEBOUNCE_MS: number = 250;
const SKELETON_ROWS: readonly number[] = [0, 1, 2, 3];

export interface AssetSearchProps {
    readonly group: CatalogGroup;
    readonly typeName: string;
    readonly query: string;
    readonly onQueryChange: (query: string) => void;
    readonly pickedId: string | null;
    readonly heldAssetIds: ReadonlySet<string>;
    readonly classes: readonly AssetClassView[];
    readonly onPick: (asset: CatalogAsset) => void;
}

function priceOf(asset: CatalogAsset, book: QuoteBook, locale: SupportedLocale): ResultPrice {
    const quote: Quote | undefined = book.quotes.get(asset.id);
    if (quote !== undefined) {
        return { state: 'ready', text: formatUnitPrice(quote.price, quote.currency, locale) };
    }
    const waiting: boolean = book.isLoading || (book.pending.has(asset.id) && !book.exhausted);
    return waiting ? { state: 'pending' } : { state: 'unavailable' };
}

function moveFocus(event: KeyboardEvent<HTMLDivElement>): void {
    const keys: Readonly<Record<string, number>> = { ArrowDown: 1, ArrowUp: -1 };
    const options: HTMLElement[] = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'));
    const current: number = options.findIndex((option: HTMLElement): boolean => option === document.activeElement);
    const edge: number | undefined = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : undefined;
    const step: number | undefined = keys[event.key];
    const target: number | undefined = edge ?? (step === undefined ? undefined : Math.min(Math.max(current + step, 0), options.length - 1));
    if (target !== undefined) {
        event.preventDefault();
        options[target]?.focus();
    }
}

function useFocusSearch(container: RefObject<HTMLDivElement | null>): void {
    useEffect((): void => {
        container.current?.querySelector<HTMLInputElement>('input')?.focus();
    }, [container]);
}

function SearchStatus({ search, count }: { readonly search: UseQueryResult<CatalogSearchResponse>; readonly count: number }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const searching: boolean = search.isFetching && search.data === undefined;
    const empty: boolean = search.isSuccess && count === 0;
    return (
        <p role="status" aria-live="polite" className={empty || searching ? 'text-sm text-content-muted' : 'sr-only'}>
            {searching ? t('search.loading') : null}
            {empty ? t('search.empty') : null}
            {search.isSuccess && count > 0 ? t('search.found', { count }) : null}
        </p>
    );
}

interface Results {
    readonly search: UseQueryResult<CatalogSearchResponse>;
    readonly assets: readonly CatalogAsset[];
    readonly book: QuoteBook;
}

function useResults(group: CatalogGroup, query: string): Results {
    const debounced: string = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
    const search: UseQueryResult<CatalogSearchResponse> = useCatalogSearch({ group, q: debounced });
    const assets: readonly CatalogAsset[] = search.data?.data ?? [];
    const book: QuoteBook = useQuotes(assets.map((asset: CatalogAsset): string => asset.id));
    return { search, assets, book };
}

function ResultSkeleton(): ReactElement {
    return (
        <div className="flex flex-col gap-2" aria-hidden="true">
            {SKELETON_ROWS.map((row: number): ReactElement => (
                <Skeleton key={row} className="h-14 w-full" />
            ))}
        </div>
    );
}

interface ResultListProps extends Pick<AssetSearchProps, 'pickedId' | 'heldAssetIds' | 'classes' | 'onPick'> {
    readonly results: Results;
}

function ResultList({ results, pickedId, heldAssetIds, classes, onPick }: ResultListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const { assets, book, search }: Results = results;
    const tabbable: string | undefined = assets.find((asset: CatalogAsset): boolean => asset.id === pickedId)?.id ?? assets[0]?.id;
    return (
        <div
            role="listbox"
            tabIndex={-1}
            aria-label={t('search.resultsLabel')}
            aria-busy={search.isFetching}
            onKeyDown={moveFocus}
            className="flex flex-col gap-2"
        >
            {assets.map((asset: CatalogAsset): ReactElement => (
                <AssetResultItem
                    key={asset.id}
                    asset={asset}
                    colorKey={colorKeyForClassKey(classes, asset.suggestedClassKey)}
                    price={priceOf(asset, book, locale)}
                    selected={asset.id === pickedId}
                    held={heldAssetIds.has(asset.id)}
                    tabIndex={asset.id === tabbable ? 0 : -1}
                    onPick={onPick}
                />
            ))}
        </div>
    );
}

export function AssetSearch({
    group,
    typeName,
    query,
    onQueryChange,
    pickedId,
    heldAssetIds,
    classes,
    onPick
}: AssetSearchProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const container: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
    useFocusSearch(container);
    const results: Results = useResults(group, query);
    return (
        <div ref={container} className="flex flex-col gap-3">
            <SearchInput
                value={query}
                onChange={onQueryChange}
                placeholder={t('search.placeholder')}
                label={t('search.label', { type: typeName })}
            />
            <SearchStatus search={results.search} count={results.assets.length} />
            {results.search.isError ? <Alert tone="caution" title={t('search.failed')} /> : null}
            {results.search.isPending ? <ResultSkeleton /> : null}
            <ResultList results={results} pickedId={pickedId} heldAssetIds={heldAssetIds} classes={classes} onPick={onPick} />
        </div>
    );
}
