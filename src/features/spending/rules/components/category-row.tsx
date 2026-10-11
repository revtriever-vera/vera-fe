import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { UpdateCategoryInput } from '../api/use-update-category.mutation';
import { useId, useState, type ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { Badge } from '@/shared/ui/badge';
import { Balloon } from '@/shared/ui/tooltip';
import { CategoryTile } from '../../components/category-tile';
import { FlexibilityToggle } from '../../components/flexibility-toggle';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import type { CategoryView, IconKey } from '../../types';
import { useUpdateCategory } from '../api/use-update-category.mutation';
import { CategoryNameEditor } from './category-name-editor';
import { IconPicker } from './icon-picker';

export interface CategoryRowProps {
    readonly category: CategoryView;
    readonly onDelete: (category: CategoryView) => void;
}

const ICON_BUTTON: string =
    'inline-flex size-9 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-content disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

const LOCKED_BUTTON: string =
    'inline-flex size-9 cursor-not-allowed items-center justify-center rounded-control text-content-muted opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

function LockedDelete({ label }: { readonly label: string }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const hintId: string = useId();
    return (
        <>
            <Balloon text={t('categories.deleteLocked')}>
                <button type="button" aria-label={label} aria-disabled="true" aria-describedby={hintId} className={LOCKED_BUTTON}>
                    <Trash2 className="size-4" aria-hidden="true" />
                </button>
            </Balloon>
            <span id={hintId} className="sr-only">
                {t('categories.deleteLocked')}
            </span>
        </>
    );
}

function DeleteAction({
    category,
    name,
    onDelete
}: {
    readonly category: CategoryView;
    readonly name: string;
    readonly onDelete: (category: CategoryView) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const label: string = t('categories.delete', { name });
    if (category.isSystem) {
        return <LockedDelete label={label} />;
    }
    return (
        <button
            type="button"
            aria-label={label}
            className={ICON_BUTTON}
            onClick={(): void => {
                onDelete(category);
            }}
        >
            <Trash2 className="size-4" aria-hidden="true" />
        </button>
    );
}

function useIconChange(category: CategoryView): (icon: IconKey) => void {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<CategoryView, ApiError, UpdateCategoryInput> = useUpdateCategory();
    return (icon: IconKey): void => {
        update.mutate(
            { id: category.id, body: { icon } },
            {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('toasts.iconChanged') });
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('toasts.categorySaveFailed'), detail: spendingErrorMessage(ts, error) });
                }
            }
        );
    };
}

function RowActions({
    category,
    name,
    onRename,
    onDelete
}: {
    readonly category: CategoryView;
    readonly name: string;
    readonly onRename: () => void;
    readonly onDelete: (category: CategoryView) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const changeIcon: (icon: IconKey) => void = useIconChange(category);
    return (
        <div className="flex items-center gap-1">
            <button type="button" aria-label={t('categories.rename', { name })} className={ICON_BUTTON} onClick={onRename}>
                <Pencil className="size-4" aria-hidden="true" />
            </button>
            {category.isSystem ? null : (
                <IconPicker value={category.icon} onChange={changeIcon} label={t('categories.changeIcon', { name })} />
            )}
            <DeleteAction category={category} name={name} onDelete={onDelete} />
        </div>
    );
}

export function CategoryRow({ category, onDelete }: CategoryRowProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const label: CategoryLabel = useCategoryLabel();
    const [editing, setEditing] = useState<boolean>(false);
    const name: string = label(category);
    const stopEditing = (): void => {
        setEditing(false);
    };
    return (
        <li className="flex flex-wrap items-center gap-3 px-4 py-3">
            <CategoryTile category={category} size="sm" />
            {editing ? (
                <CategoryNameEditor category={category} currentName={name} onDone={stopEditing} />
            ) : (
                <span className="min-w-0 flex-1 truncate font-medium text-content">{name}</span>
            )}
            {category.isSystem ? <Badge>{t('categories.defaultBadge')}</Badge> : null}
            <FlexibilityToggle category={category} />
            <RowActions
                category={category}
                name={name}
                onRename={(): void => {
                    setEditing(true);
                }}
                onDelete={onDelete}
            />
        </li>
    );
}
