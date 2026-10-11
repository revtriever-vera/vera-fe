import { CATEGORY_KIND, type CategoryKind, type CategoryView } from '../types';
import type { CategoryLabel } from './use-category-label';

export type PickerDirection = 'in' | 'out';

export type PickerWarning = 'incomeInOutflow' | 'expenseInInflow';

export interface PickerOption {
    readonly id: string | null;
    readonly category: CategoryView | null;
    readonly label: string;
    readonly warning: PickerWarning | null;
}

export interface PickerGroup {
    readonly kind: CategoryKind | null;
    readonly options: readonly PickerOption[];
}

export const PICKER_KIND_ORDER: readonly CategoryKind[] = [CATEGORY_KIND.expense, CATEGORY_KIND.income, CATEGORY_KIND.transfer];

export function normalizeSearch(text: string): string {
    return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function warningFor(kind: CategoryKind, direction: PickerDirection | undefined): PickerWarning | null {
    if (direction === 'out' && kind === CATEGORY_KIND.income) {
        return 'incomeInOutflow';
    }
    if (direction === 'in' && kind === CATEGORY_KIND.expense) {
        return 'expenseInInflow';
    }
    return null;
}

function byPosition(a: CategoryView, b: CategoryView): number {
    return a.position - b.position;
}

export interface PickerInput {
    readonly categories: readonly CategoryView[];
    readonly label: CategoryLabel;
    readonly query: string;
    readonly direction: PickerDirection | undefined;
}

function groupOf(kind: CategoryKind, input: PickerInput): PickerGroup {
    const needle: string = normalizeSearch(input.query);
    const options: PickerOption[] = input.categories
        .filter((category: CategoryView): boolean => category.kind === kind)
        .sort(byPosition)
        .map((category: CategoryView): PickerOption => ({
            id: category.id,
            category,
            label: input.label(category),
            warning: warningFor(category.kind, input.direction)
        }))
        .filter((option: PickerOption): boolean => normalizeSearch(option.label).includes(needle));
    return { kind, options };
}

export function pickerGroups(input: PickerInput, noneLabel: string | null): readonly PickerGroup[] {
    const groups: PickerGroup[] = PICKER_KIND_ORDER.map((kind: CategoryKind): PickerGroup => groupOf(kind, input)).filter(
        (group: PickerGroup): boolean => group.options.length > 0
    );
    const showNone: boolean = noneLabel !== null && normalizeSearch(noneLabel).includes(normalizeSearch(input.query));
    if (noneLabel === null || !showNone) {
        return groups;
    }
    return [{ kind: null, options: [{ id: null, category: null, label: noneLabel, warning: null }] }, ...groups];
}

export function selectableOptions(groups: readonly PickerGroup[]): readonly PickerOption[] {
    return groups
        .flatMap((group: PickerGroup): readonly PickerOption[] => group.options)
        .filter((option: PickerOption): boolean => option.warning === null);
}

export function nextIndex(current: number, step: 1 | -1, total: number): number {
    if (total === 0) {
        return -1;
    }
    if (current < 0) {
        return step === 1 ? 0 : total - 1;
    }
    return (current + step + total) % total;
}
