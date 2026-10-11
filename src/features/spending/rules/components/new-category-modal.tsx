import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { z } from 'zod';
import type { CategoryView, CreateCategoryBody } from '../../types';
import { useMemo, useState, type ReactElement } from 'react';
import { Controller, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useUnsavedGuard, type UnsavedGuard } from '@/shared/lib/use-unsaved-guard';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import { CREATABLE_CATEGORY_KINDS, type CategoryFlexibility } from '../../types';
import { useCreateCategory } from '../api/use-create-category.mutation';
import { LIMIT_REACHED_CODE, NAME_TAKEN_CODE, problemCode } from '../lib/problem';
import { createCategorySchema, type CategoryFormInput } from '../schemas/category.schema';
import { IconPicker } from './icon-picker';
import { UnsavedDialog } from './unsaved-dialog';

const FORM_ID: string = 'new-category-form';
const FLEXIBILITY_VALUES: readonly CategoryFlexibility[] = ['fixed', 'flexible'];
const DEFAULTS: CategoryFormInput = { name: '', kind: 'expense', flexibility: 'flexible', icon: 'CircleEllipsis' };

export interface NewCategoryModalProps {
    readonly onClose: () => void;
}

interface Submission {
    readonly submit: (input: CategoryFormInput) => void;
    readonly busy: boolean;
    readonly limitReached: boolean;
}

function useSubmission(form: UseFormReturn<CategoryFormInput>, onClose: () => void): Submission {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const create: UseMutationResult<CategoryView, ApiError, CreateCategoryBody> = useCreateCategory();
    const [limitReached, setLimitReached] = useState<boolean>(false);
    const fail = (error: Error): void => {
        setLimitReached(problemCode(error) === LIMIT_REACHED_CODE);
        if (problemCode(error) === NAME_TAKEN_CODE) {
            form.setError('name', { type: 'server', message: t('categories.errors.nameTaken') });
            form.setFocus('name');
            return;
        }
        if (problemCode(error) !== LIMIT_REACHED_CODE) {
            toast.show({ tone: 'critical', title: t('toasts.categorySaveFailed'), detail: spendingErrorMessage(ts, error) });
        }
    };
    const submit = (input: CategoryFormInput): void => {
        create.mutate(
            {
                name: input.name,
                kind: input.kind,
                icon: input.icon,
                ...(input.kind === 'expense' ? { flexibility: input.flexibility } : {})
            },
            {
                onSuccess: (): void => {
                    track('spending_category_created');
                    toast.show({ tone: 'positive', title: t('toasts.categoryCreated') });
                    onClose();
                },
                onError: fail
            }
        );
    };
    return { submit, busy: create.isPending, limitReached };
}

function KindControl({ form }: { readonly form: UseFormReturn<CategoryFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const options: readonly SegmentedOption<CategoryFormInput['kind']>[] = CREATABLE_CATEGORY_KINDS.map(
        (value: CategoryFormInput['kind']): SegmentedOption<CategoryFormInput['kind']> => ({
            value,
            label: t(`newCategory.kinds.${value}`)
        })
    );
    return (
        <Controller
            control={form.control}
            name="kind"
            render={({ field }): ReactElement => (
                <SegmentedControl
                    label={t('newCategory.kindLabel')}
                    options={options}
                    value={field.value}
                    onChange={(kind: CategoryFormInput['kind']): void => {
                        field.onChange(kind);
                        form.setValue('flexibility', kind === 'expense' ? 'flexible' : undefined, { shouldDirty: true });
                    }}
                />
            )}
        />
    );
}

function FlexibilityControl({ form }: { readonly form: UseFormReturn<CategoryFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const options: readonly SegmentedOption<CategoryFlexibility>[] = FLEXIBILITY_VALUES.map(
        (value: CategoryFlexibility): SegmentedOption<CategoryFlexibility> => ({ value, label: t(`newCategory.flexibility.${value}`) })
    );
    return (
        <Controller
            control={form.control}
            name="flexibility"
            render={({ field }): ReactElement => (
                <SegmentedControl
                    label={t('newCategory.flexibilityLabel')}
                    options={options}
                    value={field.value ?? 'flexible'}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

function Labeled({ label, children }: { readonly label: string; readonly children: ReactElement }): ReactElement {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-content">{label}</span>
            {children}
        </div>
    );
}

function CategoryFields({ form }: { readonly form: UseFormReturn<CategoryFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const kind: CategoryFormInput['kind'] = useWatch({ control: form.control, name: 'kind' });
    return (
        <>
            <Field
                label={t('newCategory.nameLabel')}
                error={form.formState.errors.name?.message}
                autoComplete="off"
                {...form.register('name')}
            />
            <Labeled label={t('newCategory.kindLabel')}>
                <KindControl form={form} />
            </Labeled>
            {kind === 'expense' ? (
                <Labeled label={t('newCategory.flexibilityLabel')}>
                    <FlexibilityControl form={form} />
                </Labeled>
            ) : null}
            <Labeled label={t('newCategory.iconLabel')}>
                <Controller
                    control={form.control}
                    name="icon"
                    render={({ field }): ReactElement => (
                        <div>
                            <IconPicker value={field.value} onChange={field.onChange} label={t('newCategory.iconLabel')} />
                        </div>
                    )}
                />
            </Labeled>
        </>
    );
}

function useCategoryForm(): UseFormReturn<CategoryFormInput> {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const schema: z.ZodType<CategoryFormInput> = useMemo(() => createCategorySchema(t), [t]);
    return useForm<CategoryFormInput>({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: DEFAULTS });
}

export function NewCategoryModal({ onClose }: NewCategoryModalProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const form: UseFormReturn<CategoryFormInput> = useCategoryForm();
    const state: Submission = useSubmission(form, onClose);
    const guard: UnsavedGuard = useUnsavedGuard(form.formState.isDirty && !form.formState.isSubmitSuccessful);
    return (
        <Modal
            title={t('newCategory.title')}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('newCategory.cancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={state.busy}>
                        {state.busy ? t('newCategory.creating') : t('newCategory.create')}
                    </Button>
                </>
            }
        >
            <form
                id={FORM_ID}
                noValidate
                onSubmit={(event): void => {
                    void form.handleSubmit(state.submit)(event);
                }}
                className="flex flex-col gap-4"
            >
                <CategoryFields form={form} />
                {state.limitReached ? (
                    <p role="alert" className="text-sm text-critical">
                        {t('categories.errors.limitReached')}
                    </p>
                ) : null}
            </form>
            <UnsavedDialog guard={guard} />
        </Modal>
    );
}
