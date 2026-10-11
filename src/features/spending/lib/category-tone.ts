import { CircleHelp, ArrowLeftRight, type LucideIcon } from 'lucide-react';
import { CATEGORY_KIND, FLEXIBILITY, type CategoryTone, type CategoryView } from '../types';

export function toneOf(category: Pick<CategoryView, 'kind' | 'flexibility'> | null): CategoryTone {
    if (category === null) {
        return 'uncategorized';
    }
    if (category.kind === CATEGORY_KIND.income) {
        return 'income';
    }
    if (category.kind === CATEGORY_KIND.transfer) {
        return 'transfer';
    }
    return category.flexibility === FLEXIBILITY.flexible ? 'flexible' : 'fixed';
}

export const CATEGORY_TONE_CLASSES: Readonly<Record<CategoryTone, string>> = {
    flexible: 'bg-accent-soft text-accent-strong',
    fixed: 'bg-surface-muted text-content-muted',
    uncategorized: 'bg-caution-soft text-caution',
    income: 'bg-positive-soft text-positive',
    transfer: 'bg-surface-muted text-content-muted'
};

export const CATEGORY_TONE_ICONS: Readonly<Partial<Record<CategoryTone, LucideIcon>>> = {
    uncategorized: CircleHelp,
    transfer: ArrowLeftRight
};
