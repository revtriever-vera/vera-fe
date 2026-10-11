import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useCategories } from '../../api/use-categories.query';
import { PICKER_KIND_ORDER } from '../../lib/category-picker-model';
import { CATEGORY_KIND, type CategoriesResponse, type CategoryKind, type CategoryView } from '../../types';
import { CategoryRow } from './category-row';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { NewCategoryModal } from './new-category-modal';

function CategoryGroup({
    kind,
    categories,
    onDelete
}: {
    readonly kind: CategoryKind;
    readonly categories: readonly CategoryView[];
    readonly onDelete: (category: CategoryView) => void;
}): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const items: readonly CategoryView[] = categories
        .filter((category: CategoryView): boolean => category.kind === kind)
        .sort((a: CategoryView, b: CategoryView): number => a.position - b.position);
    if (items.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-content">{t(`categories.groups.${kind}`)}</h3>
            {kind === CATEGORY_KIND.transfer ? <p className="text-xs text-content-subtle">{t('categories.transferNote')}</p> : null}
            <ul
                aria-label={t('categories.groupLabel', { group: t(`categories.groups.${kind}`) })}
                className="surface-card divide-y divide-content-muted/10 p-0"
            >
                {items.map((category: CategoryView): ReactElement => (
                    <CategoryRow key={category.id} category={category} onDelete={onDelete} />
                ))}
            </ul>
        </div>
    );
}

function CategoriesBody({
    query,
    onDelete
}: {
    readonly query: UseQueryResult<CategoriesResponse>;
    readonly onDelete: (category: CategoryView) => void;
}): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    if (query.isPending) {
        return (
            <Loading label={t('categories.loading')} className="flex flex-col gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </Loading>
        );
    }
    if (query.isError) {
        return <FailureAlert error={query.error} title={t('categories.loadFailed')} />;
    }
    return (
        <>
            {PICKER_KIND_ORDER.map((kind: CategoryKind): ReactElement | null => (
                <CategoryGroup key={kind} kind={kind} categories={query.data.categories} onDelete={onDelete} />
            ))}
        </>
    );
}

function CategoriesHeader({ onNew }: { readonly onNew: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
                <h2 id="categories-title" className="text-lg font-bold">
                    {t('categories.title')}
                </h2>
                <p className="max-w-prose text-sm text-content-muted">{t('categories.description')}</p>
            </div>
            <Button onClick={onNew}>
                <Plus className="size-4" aria-hidden="true" />
                {t('categories.new')}
            </Button>
        </header>
    );
}

export function CategoriesSection(): ReactElement {
    const query: UseQueryResult<CategoriesResponse> = useCategories();
    const [creating, setCreating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<CategoryView | null>(null);
    return (
        <section aria-labelledby="categories-title" className="flex flex-col gap-4">
            <CategoriesHeader
                onNew={(): void => {
                    setCreating(true);
                }}
            />
            <CategoriesBody query={query} onDelete={setDeleting} />
            {creating ? (
                <NewCategoryModal
                    onClose={(): void => {
                        setCreating(false);
                    }}
                />
            ) : null}
            {deleting === null ? null : (
                <DeleteCategoryDialog
                    category={deleting}
                    onClose={(): void => {
                        setDeleting(null);
                    }}
                />
            )}
        </section>
    );
}
