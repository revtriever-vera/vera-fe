import type { ReactElement } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { useEditSeriesForm, type EditSeriesForm } from '../lib/use-edit-series-form';
import { hasExpectedDay, SERIES_NAME_MAX_LENGTH } from '../schemas/confirm-series.schema';
import type { EditSeriesFormInput } from '../schemas/edit-series.schema';
import { RECURRING_CADENCES, RECURRING_KINDS, RECURRING_VALUE_MODES, type RecurringSeriesView } from '../types';
import { OptionSelect } from './option-select';

export interface EditSeriesDialogProps {
    readonly series: RecurringSeriesView;
    readonly onClose: () => void;
}

type Form = UseFormReturn<EditSeriesFormInput>;

function CadenceSelect({ form }: { readonly form: Form }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
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
    );
}

function ValueModeSelect({ form }: { readonly form: Form }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
        <Controller
            control={form.control}
            name="valueMode"
            render={({ field }): ReactElement => (
                <OptionSelect
                    label={t('edit.valueMode')}
                    value={field.value}
                    values={RECURRING_VALUE_MODES}
                    optionLabel={(value): string => t(`edit.${value}`)}
                    onChange={field.onChange}
                />
            )}
        />
    );
}

function KindSelect({ form }: { readonly form: Form }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    return (
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
    );
}

function SelectFields({ form }: { readonly form: Form }): ReactElement {
    return (
        <>
            <CadenceSelect form={form} />
            <ValueModeSelect form={form} />
            <KindSelect form={form} />
        </>
    );
}

function EditFields({ form }: { readonly form: UseFormReturn<EditSeriesFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const errors: UseFormReturn<EditSeriesFormInput>['formState']['errors'] = form.formState.errors;
    return (
        <div className="flex flex-col gap-3">
            <Field label={t('confirm.name')} maxLength={SERIES_NAME_MAX_LENGTH} error={errors.name?.message} {...form.register('name')} />
            <SelectFields form={form} />
            <p className="text-2xs text-content-subtle">{t('edit.valueModeHint')}</p>
            {hasExpectedDay(form.watch('cadence')) ? (
                <Field
                    label={t('confirm.day')}
                    inputMode="numeric"
                    hint={t('confirm.dayHint')}
                    error={errors.expectedDay?.message}
                    {...form.register('expectedDay')}
                />
            ) : null}
        </div>
    );
}

export function EditSeriesDialog({ series, onClose }: EditSeriesDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const state: EditSeriesForm = useEditSeriesForm(series, onClose);
    return (
        <Modal
            title={t('edit.title', { name: series.name })}
            description={t('edit.description')}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('edit.cancel')}
                    </Button>
                    <Button loading={state.pending} onClick={state.submit}>
                        {t('edit.submit')}
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
                <EditFields form={state.form} />
            </form>
        </Modal>
    );
}
