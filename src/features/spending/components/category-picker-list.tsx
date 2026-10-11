import { useEffect, useRef, type ReactElement, type RefObject } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import type { PickerGroup, PickerOption, PickerWarning } from '../lib/category-picker-model';
import { CategoryTile } from './category-tile';

export function optionDomId(listId: string, option: PickerOption): string {
    return `${listId}-${option.id ?? 'none'}`;
}

interface OptionProps {
    readonly listId: string;
    readonly option: PickerOption;
    readonly selected: boolean;
    readonly active: boolean;
    readonly onPick: (id: string | null) => void;
}

function OptionWarning({ warning }: { readonly warning: PickerWarning | null }): ReactElement | null {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    if (warning === null) {
        return null;
    }
    return (
        <span className="flex items-center gap-1 text-2xs text-caution">
            <TriangleAlert className="size-3 shrink-0" aria-hidden="true" />
            {t(`picker.${warning}`)}
        </span>
    );
}

function useScrollIntoView(ref: RefObject<HTMLElement | null>, active: boolean): void {
    useEffect((): void => {
        if (active) {
            ref.current?.scrollIntoView({ block: 'nearest' });
        }
    }, [ref, active]);
}

function Option({ listId, option, selected, active, onPick }: OptionProps): ReactElement {
    const blocked: boolean = option.warning !== null;
    const ref: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);
    useScrollIntoView(ref, active);
    return (
        <button
            ref={ref}
            type="button"
            role="option"
            id={optionDomId(listId, option)}
            tabIndex={-1}
            aria-selected={selected}
            aria-disabled={blocked}
            onClick={(): void => {
                if (!blocked) {
                    onPick(option.id);
                }
            }}
            className={cn(
                'flex w-full items-center gap-2.5 rounded-control px-2 py-1.5 text-left text-sm text-content',
                active && 'bg-surface-muted',
                blocked ? 'cursor-not-allowed opacity-70' : 'hover:bg-surface-muted'
            )}
        >
            <CategoryTile category={option.category} size="sm" />
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{option.label}</span>
                <OptionWarning warning={option.warning} />
            </span>
            {selected ? <Check className="size-4 shrink-0 text-accent-strong" aria-hidden="true" /> : null}
        </button>
    );
}

export interface CategoryPickerListProps {
    readonly listId: string;
    readonly groups: readonly PickerGroup[];
    readonly value: string | null;
    readonly activeId: string | null | undefined;
    readonly onPick: (id: string | null) => void;
}

export function CategoryPickerList({ listId, groups, value, activeId, onPick }: CategoryPickerListProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    if (groups.length === 0) {
        return <p className="px-2 py-3 text-sm text-content-muted">{t('picker.empty')}</p>;
    }
    return (
        <div id={listId} role="listbox" aria-label={t('picker.listLabel')} className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {groups.map((group: PickerGroup): ReactElement => (
                <div
                    key={group.kind ?? 'none'}
                    role="group"
                    aria-label={group.kind === null ? t('categories.none') : t(`categories.groups.${group.kind}`)}
                >
                    {group.kind === null ? null : (
                        <p aria-hidden="true" className="px-2 pb-1 text-[11px] font-bold tracking-[0.08em] text-content-muted uppercase">
                            {t(`categories.groups.${group.kind}`)}
                        </p>
                    )}
                    {group.options.map((option: PickerOption): ReactElement => (
                        <Option
                            key={option.id ?? 'none'}
                            listId={listId}
                            option={option}
                            selected={option.id === value}
                            active={activeId !== undefined && option.id === activeId}
                            onPick={onPick}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
