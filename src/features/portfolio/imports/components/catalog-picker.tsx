import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { Button } from '@/shared/ui/button';
import { SearchInput } from '@/shared/ui/search-input';
import type { CatalogAsset, CatalogSearchResponse } from '../../assets/types';
import { useAssetPick } from '../api/use-asset-pick.query';
import type { PickedAsset } from '../lib/line-drafts';

const SEARCH_DEBOUNCE_MS: number = 250;

export interface CatalogPickerProps {
    readonly onPick: (asset: PickedAsset) => void;
    readonly onCancel: () => void;
}

function Results({
    search,
    onPick
}: {
    readonly search: UseQueryResult<CatalogSearchResponse>;
    readonly onPick: CatalogPickerProps['onPick'];
}): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const assets: readonly CatalogAsset[] = search.data?.data ?? [];
    if (search.isSuccess && assets.length === 0) {
        return <p className="text-sm text-content-muted">{t('catalog.empty')}</p>;
    }
    return (
        <ul className="flex flex-col gap-1">
            {assets.map((asset: CatalogAsset): ReactElement => (
                <li key={asset.id} className="flex items-center justify-between gap-2 rounded-control bg-surface-muted px-3 py-2">
                    <span className="min-w-0 truncate text-sm">
                        <b>{asset.symbol}</b> {asset.name}
                    </span>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(): void => {
                            onPick({ id: asset.id, ticker: asset.symbol, name: asset.name });
                        }}
                    >
                        {t('catalog.use', { ticker: asset.symbol })}
                    </Button>
                </li>
            ))}
        </ul>
    );
}

export function CatalogPicker({ onPick, onCancel }: CatalogPickerProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const [query, setQuery] = useState<string>('');
    const debounced: string = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
    const search: UseQueryResult<CatalogSearchResponse> = useAssetPick(debounced);
    return (
        <div className="flex flex-col gap-2 rounded-control border border-border p-3">
            <SearchInput value={query} onChange={setQuery} label={t('catalog.label')} placeholder={t('catalog.placeholder')} />
            <Results search={search} onPick={onPick} />
            <Button variant="ghost" size="sm" className="self-start" onClick={onCancel}>
                {t('catalog.cancel')}
            </Button>
        </div>
    );
}
