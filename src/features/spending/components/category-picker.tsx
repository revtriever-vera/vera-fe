import { useId, useState, type KeyboardEvent, type ReactElement } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { SearchInput } from '@/shared/ui/search-input';
import { useCategories } from '../api/use-categories.query';
import {
    nextIndex,
    pickerGroups,
    selectableOptions,
    type PickerDirection,
    type PickerGroup,
    type PickerOption
} from '../lib/category-picker-model';
import { useCategoryLabel, type CategoryLabel } from '../lib/use-category-label';
import type { CategoriesResponse, CategoryKind, CategoryView } from '../types';
import { CategoryPickerList, optionDomId } from './category-picker-list';
import { CategoryTile } from './category-tile';

export interface CategoryPickerProps {
    readonly value: string | null;
    readonly onChange: (id: string | null) => void;
    readonly direction?: PickerDirection;
    readonly allowNone?: boolean;
    readonly noneLabel?: string;
    readonly onlyKind?: CategoryKind;
    readonly excludeId?: string;
    readonly label: string;
}

const TRIGGER: string =
    'flex w-full items-center justify-between gap-2 rounded-control border border-border bg-surface-muted px-3 py-2 text-sm text-content disabled:opacity-60';
const CONTENT: string = 'z-50 w-[min(92vw,22rem)] rounded-card border border-border bg-surface p-3 shadow-popover';

interface ActiveIndex {
    readonly index: number;
    readonly reset: () => void;
    readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

function useActiveIndex(options: readonly PickerOption[], onPick: (id: string | null) => void): ActiveIndex {
    const [index, setIndex] = useState<number>(-1);
    return {
        index,
        reset: (): void => {
            setIndex(-1);
        },
        onKeyDown: (event: KeyboardEvent<HTMLElement>): void => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setIndex(nextIndex(index, event.key === 'ArrowDown' ? 1 : -1, options.length));
                return;
            }
            const active: PickerOption | undefined = options[index];
            if (event.key === 'Enter' && active !== undefined) {
                event.preventDefault();
                onPick(active.id);
            }
        }
    };
}

interface PanelProps extends CategoryPickerProps {
    readonly categories: readonly CategoryView[];
    readonly onPicked: (id: string | null) => void;
}

function PickerPanel({
    categories,
    value,
    direction,
    allowNone = false,
    noneLabel,
    onlyKind,
    excludeId,
    onPicked
}: PanelProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const label: CategoryLabel = useCategoryLabel();
    const listId: string = useId();
    const [query, setQuery] = useState<string>('');
    const groups: readonly PickerGroup[] = pickerGroups(
        { categories, label, query, direction, onlyKind, excludeId },
        allowNone ? (noneLabel ?? t('categories.none')) : null
    );
    const options: readonly PickerOption[] = selectableOptions(groups);
    const keys: ActiveIndex = useActiveIndex(options, onPicked);
    const active: PickerOption | undefined = options[keys.index];
    return (
        <div className="flex flex-col gap-2" onKeyDown={keys.onKeyDown} role="presentation">
            <SearchInput
                value={query}
                onChange={(next: string): void => {
                    setQuery(next);
                    keys.reset();
                }}
                placeholder={t('picker.search')}
                label={t('picker.searchLabel')}
                combobox={{ listId, activeId: active === undefined ? undefined : optionDomId(listId, active) }}
            />
            <CategoryPickerList listId={listId} groups={groups} value={value} activeId={active?.id} onPick={onPicked} />
        </div>
    );
}

function emptyText(props: CategoryPickerProps, t: TFunction<'spending'>): string {
    return props.allowNone === true && props.noneLabel !== undefined ? props.noneLabel : t('categories.uncategorized');
}

export function CategoryPicker(props: CategoryPickerProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const categories: UseQueryResult<CategoriesResponse> = useCategories();
    const labelOf: CategoryLabel = useCategoryLabel();
    const [open, setOpen] = useState<boolean>(false);
    const selected: CategoryView | null =
        categories.data?.categories.find((item: CategoryView): boolean => item.id === props.value) ?? null;
    const triggerText: string = props.value === null ? emptyText(props, t) : labelOf(selected);
    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    aria-label={props.label}
                    aria-haspopup="listbox"
                    disabled={categories.data === undefined}
                    className={TRIGGER}
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <CategoryTile category={selected} size="sm" />
                        <span className="truncate">{triggerText}</span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-content-subtle" aria-hidden="true" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content align="start" sideOffset={6} className={CONTENT}>
                    <PickerPanel
                        {...props}
                        categories={categories.data?.categories ?? []}
                        onPicked={(id: string | null): void => {
                            props.onChange(id);
                            setOpen(false);
                        }}
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
