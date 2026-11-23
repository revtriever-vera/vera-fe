import { useId, type ReactElement } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useCategories } from '../../api/use-categories.query';
import { CategoryPicker } from '../../components/category-picker';
import type { CategoriesResponse } from '../../types';
import { useConfirmSeriesForm, type ConfirmSeriesForm } from '../lib/use-confirm-series-form';
import { hasExpectedDay, SERIES_NAME_MAX_LENGTH, type ConfirmSeriesFormInput } from '../schemas/confirm-series.schema';
import { RECURRING_CADENCES, RECURRING_KINDS, type RecurringSeriesView } from '../types';
import { OptionSelect } from './option-select';

export interface ConfirmSeriesDialogProps {
    readonly series: RecurringSeriesView;
    readonly onClose: () => void;
}

function CategoryFields({ form, name }: { readonly form: UseFormReturn<ConfirmSeriesFormInput>; readonly name: string }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const checkboxId: string = useId();
    const categoryId: string = form.watch('categoryId');
    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-content">{t('confirm.category')}</span>
            <CategoryPicker
                value={categoryId === '' ? null : categoryId}
                onChange={(id: string | null): void => {
                    form.setValue('categoryId', id ?? '');
                }}
                direction="out"
                allowNone
                noneLabel={t('confirm.categoryNone')}
                label={t('confirm.category')}
            />
            <p className="text-2xs text-content-subtle">{t('confirm.categoryHint')}</p>
            {categoryId === '' ? null : (
                <label htmlFor={checkboxId} className="flex items-center gap-2 text-sm text-content">
                    <input id={checkboxId} type="checkbox" className="size-4 accent-accent" {...form.register('createRule')} />
                    <span className="min-w-0 break-words">{t('confirm.always', { name })}</span>
                </label>
            )}
        </div>
    );
}

function SelectFields({ form }: { readonly form: UseFormReturn<ConfirmSeriesFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <>
            <Controller
                control={form.control}
                name="cadence"
                render={({ field }): ReactElement => (
                    <OptionSelect
                        label={t('confirm.cadence')}
                        value={field.value}
                        values={RECURRING_CADENCES}
                        optionLabel={(value): string => t(`cadence.${value}`)}
                        onChange={field.onChange}
                    />
                )}
            />
            <Controller
                control={form.control}
                name="kind"
                render={({ field }): ReactElement => (
                    <OptionSelect
                        label={t('confirm.kind')}
                        value={field.value}
                        values={RECURRING_KINDS}
                        optionLabel={(value): string => t(`kind.${value}`)}
                        onChange={field.onChange}
                    />
                )}
            />
        </>
    );
}

function SeriesFields({ form }: { readonly form: UseFormReturn<ConfirmSeriesFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const errors: UseFormReturn<ConfirmSeriesFormInput>['formState']['errors'] = form.formState.errors;
    return (
        <div className="flex flex-col gap-3">
            <Field label={t('confirm.name')} maxLength={SERIES_NAME_MAX_LENGTH} error={errors.name?.message} {...form.register('name')} />
            <SelectFields form={form} />
            {hasExpectedDay(form.watch('cadence')) ? (
                <Field
                    label={t('confirm.day')}
                    inputMode="numeric"
                    hint={t('confirm.dayHint')}
                    error={errors.expectedDay?.message}
                    {...form.register('expectedDay')}
                />
            ) : null}
            <CategoryFields form={form} name={form.watch('name').trim()} />
        </div>
    );
}

function ConfirmSeriesModal({
    series,
    categories,
    onClose
}: ConfirmSeriesDialogProps & { readonly categories: CategoriesResponse }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const state: ConfirmSeriesForm = useConfirmSeriesForm(series, categories.categories, onClose);
    return (
        <Modal
            title={t('confirm.title', { name: series.name })}
            description={t('confirm.description')}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('confirm.cancel')}
                    </Button>
                    <Button loading={state.pending} onClick={state.submit}>
                        {t('confirm.submit')}
                    </Button>
                </>
            }
        >
            <form
                noValidate
                onSubmit={(event): void => {
                    event.preventDefault();
                    state.submit();
                }}
            >
                <SeriesFields form={state.form} />
            </form>
        </Modal>
    );
}

export function ConfirmSeriesDialog({ series, onClose }: ConfirmSeriesDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const categories: UseQueryResult<CategoriesResponse> = useCategories();
    if (categories.data === undefined && categories.error === null) {
        return (
            <Modal title={t('confirm.title', { name: series.name })} onClose={onClose} footer={null}>
                <Loading label={t('loading')}>
                    <Skeleton className="h-40 w-full" />
                </Loading>
            </Modal>
        );
    }
    return <ConfirmSeriesModal series={series} categories={categories.data ?? { categories: [] }} onClose={onClose} />;
}
