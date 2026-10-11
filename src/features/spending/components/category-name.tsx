import type { ReactElement } from 'react';
import { useCategoryLabel, type CategoryLabel } from '../lib/use-category-label';
import type { CategoryView } from '../types';

export interface CategoryNameProps {
    readonly category: Pick<CategoryView, 'systemKey' | 'name'> | null;
    readonly className?: string;
}

export function CategoryName({ category, className }: CategoryNameProps): ReactElement {
    const label: CategoryLabel = useCategoryLabel();
    return <span className={className}>{label(category)}</span>;
}
