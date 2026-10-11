import type { TFunction } from 'i18next';
import { z } from 'zod';
import { CATEGORY_NAME_MAX_LENGTH, CREATABLE_CATEGORY_KINDS, ICON_KEYS, type CategoryFlexibility, type IconKey } from '../../types';

const FLEXIBILITIES: [CategoryFlexibility, ...CategoryFlexibility[]] = ['fixed', 'flexible'];
const ICONS: [IconKey, ...IconKey[]] = [...ICON_KEYS];

export interface CategoryFormInput {
    name: string;
    kind: (typeof CREATABLE_CATEGORY_KINDS)[number];
    flexibility?: CategoryFlexibility;
    icon: IconKey;
}

export function categoryNameSchema(t: TFunction<'spendingRules'>): z.ZodString {
    return z.string().trim().min(1, t('categories.errors.nameRequired')).max(CATEGORY_NAME_MAX_LENGTH, t('categories.errors.nameTooLong'));
}

export function createCategorySchema(t: TFunction<'spendingRules'>): z.ZodType<CategoryFormInput> {
    return z
        .object({
            name: categoryNameSchema(t),
            kind: z.enum(CREATABLE_CATEGORY_KINDS),
            flexibility: z.enum(FLEXIBILITIES).optional(),
            icon: z.enum(ICONS)
        })
        .superRefine((value: CategoryFormInput, context: z.RefinementCtx): void => {
            if (value.kind === 'expense' && value.flexibility === undefined) {
                context.addIssue({ code: 'custom', path: ['flexibility'], message: t('newCategory.errors.flexibilityRequired') });
            }
            if (value.kind === 'income' && value.flexibility !== undefined) {
                context.addIssue({ code: 'custom', path: ['flexibility'], message: t('newCategory.errors.flexibilityNotApplicable') });
            }
        });
}
