import type { CategoryTone } from '../../types';

export type BarTone = Extract<CategoryTone, 'flexible' | 'fixed' | 'uncategorized'>;

export const BAR_FILL: Readonly<Record<BarTone, string>> = {
    flexible: 'bg-accent',
    fixed: 'bg-border-strong',
    uncategorized: 'bg-caution'
};

export const AVERAGE_MARK: string = 'h-3.5 w-0.5 bg-content';
