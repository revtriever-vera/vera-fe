import type { ReactElement } from 'react';
import { useFieldArray, type Control, type FieldErrors, type UseFieldArrayReturn, type UseFormRegister } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { MAX_RULES } from '../lib/signup-link-offer';
import type { SignupLinkFormValues } from '../schemas/signup-link.schema';

export interface SignupLinkRulesEditorProps {
    readonly control: Control<SignupLinkFormValues>;
    readonly register: UseFormRegister<SignupLinkFormValues>;
    readonly errors: FieldErrors<SignupLinkFormValues>;
}

const EMPTY_RULE: { percent: string; fromCycle: string; toCycle: string } = { percent: '', fromCycle: '', toCycle: '' };

interface RuleRowProps extends SignupLinkRulesEditorProps {
    readonly index: number;
    readonly onRemove: () => void;
}

function RuleRow({ register, errors, index, onRemove }: RuleRowProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const issue: FieldErrors<SignupLinkFormValues>['rules'] = errors.rules;
    return (
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-start gap-2">
            <Field
                label={t('formRulePercent')}
                inputMode="numeric"
                error={issue?.[index]?.percent?.message}
                {...register(`rules.${String(index) as `${number}`}.percent` as const)}
            />
            <Field
                label={t('formRuleFrom')}
                inputMode="numeric"
                error={issue?.[index]?.fromCycle?.message}
                {...register(`rules.${String(index) as `${number}`}.fromCycle` as const)}
            />
            <Field
                label={t('formRuleTo')}
                inputMode="numeric"
                error={issue?.[index]?.toCycle?.message}
                {...register(`rules.${String(index) as `${number}`}.toCycle` as const)}
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-6"
                aria-label={t('formRemoveRule', { number: index + 1 })}
                onClick={onRemove}
            >
                <Trash2 className="size-4" aria-hidden="true" />
            </Button>
        </div>
    );
}

export function SignupLinkRulesEditor({ control, register, errors }: SignupLinkRulesEditorProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const rules: UseFieldArrayReturn<SignupLinkFormValues, 'rules'> = useFieldArray({ control, name: 'rules' });
    return (
        <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-semibold">{t('formRulesTitle')}</legend>
            <p className="text-xs text-content-muted">{t('formRulesHint')}</p>
            {rules.fields.map((rule, index: number): ReactElement => (
                <RuleRow
                    key={rule.id}
                    control={control}
                    register={register}
                    errors={errors}
                    index={index}
                    onRemove={(): void => {
                        rules.remove(index);
                    }}
                />
            ))}
            {errors.rules?.message === undefined ? null : (
                <p role="alert" className="text-xs text-critical">
                    {errors.rules.message}
                </p>
            )}
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="self-start"
                disabled={rules.fields.length >= MAX_RULES}
                onClick={(): void => {
                    rules.append(EMPTY_RULE);
                }}
            >
                <Plus className="size-4" aria-hidden="true" />
                {t('formAddRule')}
            </Button>
        </fieldset>
    );
}
