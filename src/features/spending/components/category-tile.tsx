import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import { IconTile, type IconTileSize } from '@/shared/ui/icon-tile';
import { categoryIcon } from '../lib/category-icons';
import { CATEGORY_TONE_CLASSES, CATEGORY_TONE_ICONS, toneOf } from '../lib/category-tone';
import type { CategoryTone, CategoryView } from '../types';

export type CategoryTileTarget = Pick<CategoryView, 'kind' | 'flexibility'> & { readonly icon: string };

export interface CategoryTileProps {
    readonly category: CategoryTileTarget | null;
    readonly size?: Extract<IconTileSize, 'sm' | 'md'>;
}

export function CategoryTile({ category, size = 'md' }: CategoryTileProps): ReactElement {
    const tone: CategoryTone = toneOf(category);
    const icon: LucideIcon = CATEGORY_TONE_ICONS[tone] ?? categoryIcon(category?.icon ?? '');
    return <IconTile icon={icon} tone="neutral" size={size} className={CATEGORY_TONE_CLASSES[tone]} />;
}
