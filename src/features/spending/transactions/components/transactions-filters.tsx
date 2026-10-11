import { useId, useState, type ReactElement } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { Button } from '@/shared/ui/button';
import { SearchInput } from '@/shared/ui/search-input';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { SelectMenu, type SelectChoice } from '@/shared/ui/select-menu';
import { useAccounts } from '../../api/use-accounts.query';
import { useCategories } from '../../api/use-categories.query';
import { CategoryPicker } from '../../components/category-picker';
import { MonthSwitcher } from '../../components/month-switcher';
import type { TransactionsSearch } from '../../schemas/spending-search.schema';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import type { AccountView, AccountsResponse, CategoriesResponse, CategoryView } from '../../types';
import { monthNeighbors, currentMonth, type MonthNeighbors } from '../lib/month-navigation';
import { secondaryFilterCount, type FilterPatch } from '../lib/transaction-filters';
import { useSearchText, type SearchText } from '../lib/use-search-text';

const ALL: string = 'all';
const NARROW_QUERY: string = '(max-width: 639px)';

export interface TransactionsFiltersProps {
    readonly search: TransactionsSearch;
    readonly month: string;
    readonly hasFilters: boolean;
    readonly onChange: (patch: FilterPatch) => void;
    readonly onClear: () => void;
}

type FilterProps = Pick<TransactionsFiltersProps, 'search' | 'onChange'>;
type Direction = 'all' | 'in' | 'out';

function AccountFilter({ search, onChange }: FilterProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const accounts: UseQueryResult<AccountsResponse> = useAccounts();
    const labelId: string = useId();
    const choices: readonly SelectChoice[] = [
        { value: ALL, label: t('filters.allAccounts'), warning: null },
        ...(accounts.data?.accounts ?? []).map((account: AccountView): SelectChoice => ({
            value: account.id,
            label: account.name,
            warning: null
        }))
    ];
    return (
        <div className="min-w-0 sm:w-52">
            <span id={labelId} className="sr-only">
                {t('filters.account')}
            </span>
            <SelectMenu
                ariaLabelledBy={labelId}
                value={search.accountId ?? ALL}
                choices={choices}
                placeholder={t('filters.allAccounts')}
                onChange={(value: string): void => {
                    onChange({ accountId: value === ALL ? undefined : value });
                }}
            />
        </div>
    );
}

function CategoryFilter({ search, onChange }: FilterProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const categories: UseQueryResult<CategoriesResponse> = useCategories();
    const labelOf: CategoryLabel = useCategoryLabel();
    const selected: CategoryView | null =
        categories.data?.categories.find((item: CategoryView): boolean => item.id === search.categoryId) ?? null;
    const current: string =
        search.uncategorized === true
            ? t('filters.noneOption')
            : search.categoryId === undefined
              ? t('filters.allCategories')
              : labelOf(selected);
    return (
        <div className="min-w-0 sm:w-56">
            <CategoryPicker
                value={search.categoryId ?? null}
                allowNone
                noneLabel={t('filters.noneOption')}
                emptyLabel={current}
                label={t('filters.categoryWithValue', { value: current })}
                onChange={(id: string | null): void => {
                    onChange(id === null ? { uncategorized: true } : { categoryId: id });
                }}
            />
        </div>
    );
}

function DirectionFilter({ search, onChange }: FilterProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const options: readonly SegmentedOption<Direction>[] = [
        { value: 'all', label: t('filters.all') },
        { value: 'out', label: t('filters.out') },
        { value: 'in', label: t('filters.in') }
    ];
    return (
        <SegmentedControl
            label={t('filters.direction')}
            options={options}
            value={search.direction ?? 'all'}
            onChange={(value: Direction): void => {
                onChange({ direction: value === 'all' ? undefined : value });
            }}
        />
    );
}

function SearchFilter({ text, onChange }: { readonly text: string; readonly onChange: (value: string) => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    return (
        <SearchInput
            className="min-w-0 flex-1 sm:max-w-xs"
            value={text}
            onChange={onChange}
            placeholder={t('filters.search')}
            label={t('filters.search')}
        />
    );
}

function SecondaryFilters(props: FilterProps): ReactElement {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <AccountFilter {...props} />
            <CategoryFilter {...props} />
            <DirectionFilter {...props} />
        </div>
    );
}

function FiltersPanel(props: FilterProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const [open, setOpen] = useState<boolean>(false);
    const panelId: string = useId();
    const count: number = secondaryFilterCount(props.search);
    return (
        <div className="flex flex-col gap-2">
            <Button
                variant="secondary"
                className="self-start"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={(): void => {
                    setOpen(!open);
                }}
            >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                {count > 0 ? t('filters.panelCount', { count }) : t('filters.panel')}
            </Button>
            <div id={panelId} hidden={!open}>
                <SecondaryFilters {...props} />
            </div>
        </div>
    );
}

export function TransactionsFilters({ search, month, hasFilters, onChange, onClear }: TransactionsFiltersProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const narrow: boolean = useMediaQuery(NARROW_QUERY);
    const neighbors: MonthNeighbors = monthNeighbors(month, currentMonth());
    const query: SearchText = useSearchText(search.q ?? '', (value: string): void => {
        onChange({ q: value });
    });
    return (
        <section aria-label={t('filters.label')} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <MonthSwitcher
                    month={month}
                    {...neighbors}
                    onChange={(next: string): void => {
                        onChange({ month: next });
                    }}
                />
                <SearchFilter text={query.text} onChange={query.change} />
            </div>
            {narrow ? <FiltersPanel search={search} onChange={onChange} /> : <SecondaryFilters search={search} onChange={onChange} />}
            {hasFilters ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={(): void => {
                        query.reset();
                        onClear();
                    }}
                >
                    {t('filters.clear')}
                </Button>
            ) : null}
        </section>
    );
}
