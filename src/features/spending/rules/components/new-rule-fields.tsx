import type { ReactElement } from 'react';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Field } from '@/shared/ui/field';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { CategoryPicker } from '../../components/category-picker';
import { CREATABLE_RULE_TYPES, RULE_APPLIES_TO, type RulePreview as RulePreviewData } from '../../types';
import { pickerDirection } from '../lib/rule-labels';
import type { RuleFormInput } from '../schemas/rule.schema';
import { RulePreview } from './rule-preview';

export interface NewRuleFieldsProps {
    readonly form: UseFormReturn<RuleFormInput>;
    readonly preview: UseQueryResult<RulePreviewData>;
    readonly previewActive: boolean;
    readonly patternError: string | undefined;
}

function Labeled({ label, children }: { readonly label: string; readonly children: ReactElement }): ReactElement {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-content">{label}</span>
            {children}
        </div>
    );
}

type FormProps = { readonly form: UseFormReturn<RuleFormInput> };

function TypeField({ form }: FormProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const options: readonly SegmentedOption<RuleFormInput['matchType']>[] = CREATABLE_RULE_TYPES.map(
        (value: RuleFormInput['matchType']): SegmentedOption<RuleFormInput['matchType']> => ({ value, label: t(`newRule.types.${value}`) })
    );
    return (
        <Labeled label={t('newRule.typeLabel')}>
            <Controller
                control={form.control}
                name="matchType"
                render={({ field }): ReactElement => (
                    <SegmentedControl label={t('newRule.typeLabel')} options={options} value={field.value} onChange={field.onChange} />
                )}
            />
        </Labeled>
    );
}

function DirectionField({ form }: FormProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const options: readonly SegmentedOption<RuleFormInput['appliesTo']>[] = RULE_APPLIES_TO.map(
        (value: RuleFormInput['appliesTo']): SegmentedOption<RuleFormInput['appliesTo']> => ({
            value,
            label: t(`newRule.appliesTo.${value}`)
        })
    );
    return (
        <Labeled label={t('newRule.appliesToLabel')}>
            <Controller
                control={form.control}
                name="appliesTo"
                render={({ field }): ReactElement => (
                    <SegmentedControl label={t('newRule.appliesToLabel')} options={options} value={field.value} onChange={field.onChange} />
                )}
            />
        </Labeled>
    );
}

function CategoryField({ form }: FormProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const appliesTo: RuleFormInput['appliesTo'] = useWatch({ control: form.control, name: 'appliesTo' });
    return (
        <Labeled label={t('newRule.categoryLabel')}>
            <Controller
                control={form.control}
                name="categoryId"
                render={({ field, fieldState }): ReactElement => (
                    <div className="flex flex-col gap-1">
                        <CategoryPicker
                            label={t('newRule.categoryLabel')}
                            value={field.value === '' ? null : field.value}
                            onChange={(id: string | null): void => {
                                field.onChange(id ?? '');
                            }}
                            direction={pickerDirection(appliesTo)}
                        />
                        {fieldState.error === undefined ? null : (
                            <p role="alert" className="text-2xs text-critical">
                                {fieldState.error.message}
                            </p>
                        )}
                    </div>
                )}
            />
        </Labeled>
    );
}

export function NewRuleFields({ form, preview, previewActive, patternError }: NewRuleFieldsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <div className="flex flex-col gap-4">
            <TypeField form={form} />
            <Field
                label={t('newRule.patternLabel')}
                hint={t('newRule.patternHint')}
                error={patternError}
                autoComplete="off"
                {...form.register('pattern')}
            />
            <DirectionField form={form} />
            <RulePreview query={preview} active={previewActive} />
            <CategoryField form={form} />
            <label className="flex items-center gap-2 text-sm text-content">
                <input type="checkbox" className="size-4 accent-accent" {...form.register('applyToPast')} />
                {t('newRule.applyToPast')}
            </label>
        </div>
    );
}
