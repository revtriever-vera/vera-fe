import { useMemo, type BaseSyntheticEvent, type SyntheticEvent, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { DateField } from '@/shared/ui/date-field';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { useCreateSignupLink } from '../api/use-create-signup-link.mutation';
import { EMPTY_SIGNUP_LINK_FORM, toCreateInput } from '../lib/signup-link-input';
import { noCardLastIso, todayIso } from '../lib/signup-link-dates';
import { signupLinkErrorMessage } from '../lib/signup-link-error-message';
import { TRIAL_KIND } from '../lib/signup-link-offer';
import { createSignupLinkSchema, type SignupLinkFormValues } from '../schemas/signup-link.schema';
import type { DiscountRule, SignupLink, TrialKind } from '../types';
import { SignupLinkPreview } from './signup-link-preview';
import { SignupLinkRulesEditor } from './signup-link-rules-editor';

export interface SignupLinkFormProps {
    readonly onCreated: (link: SignupLink) => void;
    readonly onClose: () => void;
}

const FORM_ID: string = 'signup-link-form';

function numericRules(values: SignupLinkFormValues['rules'] | undefined): readonly DiscountRule[] {
    return (values ?? []).map((rule): DiscountRule => ({
        percent: Number(rule.percent),
        fromCycle: Number(rule.fromCycle),
        toCycle: Number(rule.toCycle)
    }));
}

function TrialFields({ form }: { readonly form: UseFormReturn<SignupLinkFormValues> }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const kind: TrialKind = useWatch({ control: form.control, name: 'trialKind' });
    const hints: Record<TrialKind, string> = {
        none: t('formTrialHintNone'),
        card: t('formTrialHintCard'),
        no_card: t('formTrialHintNoCard')
    };
    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">{t('formTrialLabel')}</span>
            <Controller
                control={form.control}
                name="trialKind"
                render={({ field }): ReactElement => (
                    <SegmentedControl
                        label={t('formTrialLabel')}
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                            { value: TRIAL_KIND.none, label: t('formTrialNone') },
                            { value: TRIAL_KIND.card, label: t('formTrialCard') },
                            { value: TRIAL_KIND.noCard, label: t('formTrialNoCard') }
                        ]}
                    />
                )}
            />
            <p className="text-xs text-content-muted">{hints[kind]}</p>
            {kind === TRIAL_KIND.none ? null : (
                <Field
                    label={t('formDays')}
                    hint={t('formDaysHint')}
                    inputMode="numeric"
                    error={form.formState.errors.days?.message}
                    {...form.register('days')}
                />
            )}
        </div>
    );
}

function LimitFields({ form }: { readonly form: UseFormReturn<SignupLinkFormValues> }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const kind: TrialKind = useWatch({ control: form.control, name: 'trialKind' });
    const noCard: boolean = kind === TRIAL_KIND.noCard;
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <Field
                label={t('formMaxUses')}
                hint={t('formMaxUsesHint')}
                inputMode="numeric"
                error={form.formState.errors.maxUses?.message}
                {...form.register('maxUses')}
            />
            <Controller
                control={form.control}
                name="expiresAt"
                render={({ field }): ReactElement => (
                    <div className="flex flex-col gap-1">
                        <DateField
                            label={t('formExpiresAt')}
                            value={field.value}
                            min={todayIso()}
                            max={noCard ? noCardLastIso() : null}
                            onChange={field.onChange}
                        />
                        <p className="text-xs text-content-muted">{t(noCard ? 'formExpiresHintNoCard' : 'formExpiresHint')}</p>
                        {form.formState.errors.expiresAt?.message === undefined ? null : (
                            <p role="alert" className="text-xs text-critical">
                                {form.formState.errors.expiresAt.message}
                            </p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}

interface SignupLinkFormState {
    readonly form: UseFormReturn<SignupLinkFormValues>;
    readonly create: ReturnType<typeof useCreateSignupLink>;
    readonly rules: readonly DiscountRule[];
    readonly submit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

function useSignupLinkForm(onCreated: (link: SignupLink) => void): SignupLinkFormState {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const create: ReturnType<typeof useCreateSignupLink> = useCreateSignupLink();
    const schema: ReturnType<typeof createSignupLinkSchema> = useMemo(() => createSignupLinkSchema(t), [t]);
    const form: UseFormReturn<SignupLinkFormValues> = useForm<SignupLinkFormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: EMPTY_SIGNUP_LINK_FORM
    });
    const watched: SignupLinkFormValues['rules'] | undefined = useWatch({ control: form.control, name: 'rules' });
    const onValid: (values: SignupLinkFormValues) => Promise<void> = async (values: SignupLinkFormValues): Promise<void> => {
        try {
            onCreated(await create.mutateAsync(toCreateInput(values)));
        } catch {
            return;
        }
    };
    const handle: (event?: BaseSyntheticEvent) => Promise<void> = form.handleSubmit(onValid);
    const submit = (event: SyntheticEvent<HTMLFormElement>): void => {
        void handle(event);
    };
    return { form, create, rules: numericRules(watched), submit };
}

export function SignupLinkForm({ onCreated, onClose }: SignupLinkFormProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { form, create, rules, submit }: SignupLinkFormState = useSignupLinkForm(onCreated);

    return (
        <Modal
            title={t('formTitle')}
            description={t('formDescription')}
            size="wide"
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t('formCancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={create.isPending}>
                        {create.isPending ? t('formSubmitting') : t('formSubmit')}
                    </Button>
                </>
            }
        >
            <form id={FORM_ID} noValidate className="flex flex-col gap-4" onSubmit={submit}>
                {create.isError ? <Alert title={signupLinkErrorMessage(t, create.error)} /> : null}
                <Field
                    label={t('formLabelField')}
                    hint={t('formLabelHint')}
                    error={form.formState.errors.label?.message}
                    {...form.register('label')}
                />
                <TrialFields form={form} />
                <LimitFields form={form} />
                <SignupLinkRulesEditor control={form.control} register={form.register} errors={form.formState.errors} />
                <SignupLinkPreview rules={rules} />
            </form>
        </Modal>
    );
}
