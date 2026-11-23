import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useCategories } from '../api/use-categories.query';
import { useCategoryLabel, type CategoryLabel } from '../lib/use-category-label';
import type { CategoriesResponse, CategoryView } from '../types';
import { CategoryTile } from './category-tile';

export function CategoryReadOnly({ categoryId }: { readonly categoryId: string | null }): ReactElement {
    const labelOf: CategoryLabel = useCategoryLabel();
    const categories: UseQueryResult<CategoriesResponse> = useCategories();
    const category: CategoryView | null = categories.data?.categories.find((item: CategoryView): boolean => item.id === categoryId) ?? null;
    return (
        <span className="flex min-w-0 items-center gap-2">
            <CategoryTile category={category} size="sm" />
            <span className="min-w-0 break-words">{labelOf(category)}</span>
        </span>
    );
}
