import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SYSTEM_CATEGORY_KEYS, type SystemCategoryKey } from '../types';

export type CategoryLabel = (category: { readonly systemKey: string | null; readonly name: string | null } | null) => string;

export function isSystemCategoryKey(value: string): value is SystemCategoryKey {
    return (SYSTEM_CATEGORY_KEYS as readonly string[]).includes(value);
}

export function useCategoryLabel(): CategoryLabel {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    return (category): string => {
        if (category === null) {
            return t('categories.uncategorized');
        }
        if (category.name !== null) {
            return category.name;
        }
        return category.systemKey !== null && isSystemCategoryKey(category.systemKey)
            ? t(`categories.names.${category.systemKey}`)
            : t('categories.customName');
    };
}
