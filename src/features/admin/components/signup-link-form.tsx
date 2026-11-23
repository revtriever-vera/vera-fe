import { useMemo, type BaseSyntheticEvent, type SyntheticEvent, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import type { TFunction } from 'i18next';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { DateField } from '@/shared/ui/date-field';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { useCreateSignupLink } from '../api/use-create-signup-link.mutation';
import { useUpdateSignupLink } from '../api/use-update-signup-link.mutation';
import { EMPTY_SIGNUP_LINK_FORM, toCreateInput, toFormValues, toUpdateInput } from '../lib/signup-link-input';
import { localIso, noCardLastIso, todayIso } from '../lib/signup-link-dates';
import { signupLinkErrorMessage } from '../lib/signup-link-error-message';
import { TRIAL_KIND } from '../lib/signup-link-offer';
import { createSignupLinkSchema, type SignupLinkFormValues } from '../schemas/signup-link.schema';
import type { DiscountRule, SignupLink, TrialKind } from '../types';
import { SignupLinkPreview } from './signup-link-preview';
import { SignupLinkRulesEditor } from './signup-link-rules-editor';

export interface SignupLinkFormProps {
    readonly link: SignupLink | null;
    readonly onSaved: (link: SignupLink) => void;
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

interface ExpiryFieldProps {
    readonly form: UseFormReturn<SignupLinkFormValues>;
    readonly unchangedExpiry: string | null;
    readonly noCard: boolean;
}

function ExpiryField({ form, unchangedExpiry, noCard }: ExpiryFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const earliest: string = unchangedExpiry !== null && unchangedExpiry < todayIso() ? unchangedExpiry : todayIso();
    return (
        <Controller
            control={form.control}
            name="expiresAt"
            render={({ field }): ReactElement => (
                <div className="flex flex-col gap-1">
                    <DateField
                        label={t('formExpiresAt')}
                        value={field.value}
                        min={earliest}
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
    );
}

function LimitFields({
    form,
    unchangedExpiry
}: {
    readonly form: UseFormReturn<SignupLinkFormValues>;
    readonly unchangedExpiry: string | null;
}): ReactElement {
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
            <ExpiryField form={form} unchangedExpiry={unchangedExpiry} noCard={noCard} />
        </div>
    );
}

function OfferValidityField({ form }: { readonly form: UseFormReturn<SignupLinkFormValues> }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <Field
            label={t('formOfferValidity')}
            hint={t('formOfferValidityHint')}
            inputMode="numeric"
            error={form.formState.errors.offerValidityDays?.message}
            {...form.register('offerValidityDays')}
        />
    );
}

interface SignupLinkFormState {
    readonly form: UseFormReturn<SignupLinkFormValues>;
    readonly save: { readonly isPending: boolean; readonly isError: boolean; readonly error: Error | null };
    readonly unchangedExpiry: string | null;
    readonly rules: readonly DiscountRule[];
    readonly submit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

function expiryDayOf(link: SignupLink | null): string | null {
    const expiresAt: string | null = link?.expiresAt ?? null;
    return expiresAt === null ? null : localIso(new Date(expiresAt));
}

function submitLabel(t: TFunction<'admin'>, editing: boolean, pending: boolean): string {
    if (pending) {
        return t(editing ? 'formSaving' : 'formSubmitting');
    }
    return t(editing ? 'formSave' : 'formSubmit');
}

function useSignupLinkForm(link: SignupLink | null, onSaved: (link: SignupLink) => void): SignupLinkFormState {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const create: ReturnType<typeof useCreateSignupLink> = useCreateSignupLink();
    const update: ReturnType<typeof useUpdateSignupLink> = useUpdateSignupLink();
    const unchangedExpiry: string | null = expiryDayOf(link);
    const schema: ReturnType<typeof createSignupLinkSchema> = useMemo(
        () => createSignupLinkSchema(t, unchangedExpiry),
        [t, unchangedExpiry]
    );
    const form: UseFormReturn<SignupLinkFormValues> = useForm<SignupLinkFormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: link === null ? EMPTY_SIGNUP_LINK_FORM : toFormValues(link)
    });
    const watched: SignupLinkFormValues['rules'] | undefined = useWatch({ control: form.control, name: 'rules' });
    const onValid: (values: SignupLinkFormValues) => Promise<void> = async (values: SignupLinkFormValues): Promise<void> => {
        try {
            onSaved(
                link === null
                    ? await create.mutateAsync(toCreateInput(values))
                    : await update.mutateAsync({ id: link.id, input: toUpdateInput(values, link) })
            );
        } catch {
            return;
        }
    };
    const handle: (event?: BaseSyntheticEvent) => Promise<void> = form.handleSubmit(onValid);
    const submit = (event: SyntheticEvent<HTMLFormElement>): void => {
        void handle(event);
    };
    return { form, save: link === null ? create : update, unchangedExpiry, rules: numericRules(watched), submit };
}

export function SignupLinkForm({ link, onSaved, onClose }: SignupLinkFormProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { form, save, unchangedExpiry, rules, submit }: SignupLinkFormState = useSignupLinkForm(link, onSaved);
    const editing: boolean = link !== null;

    return (
        <Modal
            title={t(editing ? 'formEditTitle' : 'formTitle')}
            description={t(editing ? 'formEditDescription' : 'formDescription')}
            size="wide"
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t('formCancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={save.isPending}>
                        {submitLabel(t, editing, save.isPending)}
                    </Button>
                </>
            }
        >
            <form id={FORM_ID} noValidate className="flex flex-col gap-4" onSubmit={submit}>
                {save.error === null ? null : <Alert title={signupLinkErrorMessage(t, save.error)} />}
                <Field
                    label={t('formLabelField')}
                    hint={t('formLabelHint')}
                    error={form.formState.errors.label?.message}
                    {...form.register('label')}
                />
                <TrialFields form={form} />
                <LimitFields form={form} unchangedExpiry={unchangedExpiry} />
                <OfferValidityField form={form} />
                <SignupLinkRulesEditor control={form.control} register={form.register} errors={form.formState.errors} />
                <SignupLinkPreview rules={rules} />
                {editing ? <Alert tone="caution" title={t('formEditNotice')} /> : null}
            </form>
        </Modal>
    );
}
