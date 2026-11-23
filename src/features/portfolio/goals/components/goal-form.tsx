import type { ReactElement } from 'react';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { DateField } from '@/shared/ui/date-field';
import { Field } from '@/shared/ui/field';
import { MoneyInput } from '@/shared/ui/money-input';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { HolderField } from '../../assets/components/holder-field';
import { addMonthsIso, nextDayIso } from '../lib/goal-form-values';
import type { GoalFormState } from '../lib/use-goal-form';
import type { GoalFormInput } from '../schemas/goal.schema';
import { GOAL_BASE_CURRENCY, GOAL_KIND, GOAL_MODEL_KINDS, type GoalKind, type GoalView } from '../types';
import { GoalHoldingsField } from './goal-holdings-field';
import { GoalReserveField } from './goal-reserve-field';

export const GOAL_FORM_ID: string = 'goal-form';

export interface GoalFormProps {
    readonly state: GoalFormState;
    readonly goal: GoalView | null;
}

type FormApi = UseFormReturn<GoalFormInput>;

function ModelField({ form, today }: { readonly form: FormApi; readonly today: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const kind: GoalKind = useWatch({ control: form.control, name: 'kind' });
    const options: readonly SegmentedOption<GoalKind>[] = GOAL_MODEL_KINDS.map((item: GoalKind): SegmentedOption<GoalKind> => ({
        value: item,
        label: t(`form.models.${item}.label`)
    }));
    const change = (next: GoalKind): void => {
        const names: readonly string[] = GOAL_MODEL_KINDS.map((item: GoalKind): string => t(`form.models.${item}.name`));
        if (names.includes(form.getValues('name'))) {
            form.setValue('name', t(`form.models.${next}.name`));
        }
        if (next === GOAL_KIND.emergencyReserve && form.getValues('targetDate') === null) {
            form.setValue('targetDate', addMonthsIso(today, 12));
        }
        form.setValue('kind', next, { shouldDirty: true });
    };
    return <SegmentedControl label={t('form.model')} options={options} value={kind} onChange={change} />;
}

function TargetFields({ form, today }: { readonly form: FormApi; readonly today: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Controller
                control={form.control}
                name="targetMinor"
                render={({ field }): ReactElement => (
                    <MoneyInput
                        label={t('form.target')}
                        currency={GOAL_BASE_CURRENCY}
                        value={field.value}
                        error={form.formState.errors.targetMinor?.message}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                    />
                )}
            />
            <Controller
                control={form.control}
                name="targetDate"
                render={({ field }): ReactElement => (
                    <div className="flex flex-col gap-1.5">
                        <DateField label={t('form.date')} value={field.value} min={nextDayIso(today)} onChange={field.onChange} />
                        {form.formState.errors.targetDate?.message === undefined ? null : (
                            <p role="alert" className="text-2xs text-critical">
                                {form.formState.errors.targetDate.message}
                            </p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}

function ManualField({ form }: { readonly form: FormApi }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <Controller
            control={form.control}
            name="manualMinor"
            render={({ field }): ReactElement => (
                <MoneyInput
                    label={t('form.manual')}
                    hint={t('form.manualHint')}
                    currency={GOAL_BASE_CURRENCY}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                />
            )}
        />
    );
}

function HolderControl({ form }: { readonly form: FormApi }): ReactElement | null {
    const holder: string = useWatch({ control: form.control, name: 'holder' });
    return (
        <HolderField
            value={holder}
            onChange={(next: string): void => {
                form.setValue('holder', next, { shouldDirty: true });
            }}
        />
    );
}

export function GoalForm({ state, goal }: GoalFormProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const { form }: GoalFormState = state;
    const kind: GoalKind = useWatch({ control: form.control, name: 'kind' });
    return (
        <form
            id={GOAL_FORM_ID}
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(event): void => {
                event.preventDefault();
                void state.submit();
            }}
        >
            {state.alertMessage === null ? null : <Alert title={state.alertMessage} />}
            {goal === null ? <ModelField form={form} today={state.today} /> : null}
            <Field
                label={t('form.name')}
                autoComplete="off"
                placeholder={t('form.namePlaceholder')}
                error={form.formState.errors.name?.message}
                {...form.register('name')}
            />
            {kind === GOAL_KIND.emergencyReserve ? <GoalReserveField form={form} goal={goal} /> : null}
            <TargetFields form={form} today={state.today} />
            <GoalHoldingsField form={form} usedBps={state.usedBps} />
            <ManualField form={form} />
            <HolderControl form={form} />
        </form>
    );
}
