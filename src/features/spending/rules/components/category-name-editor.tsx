import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { UpdateCategoryInput } from '../api/use-update-category.mutation';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useUnsavedGuard, type UnsavedGuard } from '@/shared/lib/use-unsaved-guard';
import { Button } from '@/shared/ui/button';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { CategoryView } from '../../types';
import { useUpdateCategory } from '../api/use-update-category.mutation';
import { NAME_TAKEN_CODE, problemCode } from '../lib/problem';
import { categoryNameSchema } from '../schemas/category.schema';
import { UnsavedDialog } from './unsaved-dialog';

export interface CategoryNameEditorProps {
    readonly category: CategoryView;
    readonly currentName: string;
    readonly onDone: () => void;
}

interface Editor {
    readonly value: string;
    readonly error: string | null;
    readonly busy: boolean;
    readonly setValue: (value: string) => void;
    readonly save: () => void;
    readonly restore: () => void;
    readonly dirty: boolean;
}

interface Rename {
    readonly run: (name: string | null, success: string) => void;
    readonly busy: boolean;
    readonly error: string | null;
    readonly clearError: () => void;
    readonly setError: (message: string | null) => void;
}

function useRename(category: CategoryView, onDone: () => void): Rename {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<CategoryView, ApiError, UpdateCategoryInput> = useUpdateCategory();
    const [error, setError] = useState<string | null>(null);
    const run = (name: string | null, success: string): void => {
        update.mutate(
            { id: category.id, body: { name } },
            {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: success });
                    onDone();
                },
                onError: (failure: Error): void => {
                    if (problemCode(failure) === NAME_TAKEN_CODE) {
                        setError(t('categories.errors.nameTaken'));
                        return;
                    }
                    toast.show({ tone: 'critical', title: t('toasts.categorySaveFailed'), detail: spendingErrorMessage(ts, failure) });
                }
            }
        );
    };
    return {
        run,
        busy: update.isPending,
        error,
        setError,
        clearError: (): void => {
            setError(null);
        }
    };
}

function useEditor({ category, currentName, onDone }: CategoryNameEditorProps): Editor {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const rename: Rename = useRename(category, onDone);
    const [value, setValue] = useState<string>(currentName);
    const save = (): void => {
        const parsed: ReturnType<ReturnType<typeof categoryNameSchema>['safeParse']> = categoryNameSchema(t).safeParse(value);
        if (!parsed.success) {
            rename.setError(parsed.error.issues[0]?.message ?? null);
            return;
        }
        if (parsed.data === currentName) {
            onDone();
            return;
        }
        rename.run(parsed.data, t('toasts.categoryRenamed'));
    };
    return {
        value,
        error: rename.error,
        busy: rename.busy,
        setValue: (next: string): void => {
            setValue(next);
            rename.clearError();
        },
        save,
        restore: (): void => {
            rename.run(null, t('toasts.nameRestored'));
        },
        dirty: value !== currentName
    };
}

function EditorActions({
    editor,
    canRestore,
    onCancel
}: {
    readonly editor: Editor;
    readonly canRestore: boolean;
    readonly onCancel: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <div className="flex flex-wrap gap-2">
            <Button size="sm" loading={editor.busy} onClick={editor.save}>
                {t('categories.save')}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
                {t('categories.cancel')}
            </Button>
            {canRestore ? (
                <Button size="sm" variant="secondary" disabled={editor.busy} onClick={editor.restore}>
                    {t('categories.restoreName')}
                </Button>
            ) : null}
        </div>
    );
}

function useFocusOnMount(): RefObject<HTMLInputElement | null> {
    const ref: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
    useEffect((): void => {
        ref.current?.focus();
        ref.current?.select();
    }, []);
    return ref;
}

function keyHandler(save: () => void, cancel: () => void): (event: KeyboardEvent<HTMLInputElement>) => void {
    return (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            save();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            cancel();
        }
    };
}

export function CategoryNameEditor(props: CategoryNameEditorProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const editor: Editor = useEditor(props);
    const guard: UnsavedGuard = useUnsavedGuard(editor.dirty);
    const input: RefObject<HTMLInputElement | null> = useFocusOnMount();
    const onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void = keyHandler(editor.save, props.onDone);
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <input
                ref={input}
                value={editor.value}
                aria-label={t('categories.nameLabel', { name: props.currentName })}
                aria-invalid={editor.error === null ? undefined : true}
                aria-describedby="category-rename-hint"
                onChange={(event): void => {
                    editor.setValue(event.target.value);
                }}
                onKeyDown={onKeyDown}
                className="h-9 w-full rounded-control border border-border bg-surface px-3 text-sm text-content focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
            <p
                id="category-rename-hint"
                role={editor.error === null ? undefined : 'alert'}
                className={editor.error === null ? 'text-2xs text-content-subtle' : 'text-2xs text-critical'}
            >
                {editor.error ?? t('categories.renameHint')}
            </p>
            <EditorActions editor={editor} canRestore={props.category.isSystem && props.category.name !== null} onCancel={props.onDone} />
            <UnsavedDialog guard={guard} />
        </div>
    );
}
