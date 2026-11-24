import { useMemo, type BaseSyntheticEvent, type ReactElement, type SyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { useCreatePlatformToken } from '../api/use-create-platform-token.mutation';
import { platformTokenErrorMessage } from '../lib/platform-token-error-message';
import {
    createPlatformTokenSchema,
    toCreateTokenInput,
    TOKEN_VALIDITY_DAYS,
    type PlatformTokenFormValues,
    type TokenValidityDays
} from '../schemas/platform-token.schema';
import type { CreatedPlatformToken } from '../types';

export interface PlatformTokenFormProps {
    readonly onCreated: (token: CreatedPlatformToken) => void;
    readonly onClose: () => void;
}

const FORM_ID: string = 'platform-token-form';

const DEFAULT_VALUES: PlatformTokenFormValues = { name: '', validity: TOKEN_VALIDITY_DAYS.quarter };

function ValidityField({ form }: { readonly form: UseFormReturn<PlatformTokenFormValues> }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">{t('tokenFormValidity')}</span>
            <Controller
                control={form.control}
                name="validity"
                render={({ field }): ReactElement => (
                    <SegmentedControl<TokenValidityDays>
                        label={t('tokenFormValidity')}
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                            { value: TOKEN_VALIDITY_DAYS.month, label: t('tokenValidityDays', { count: 30 }) },
                            { value: TOKEN_VALIDITY_DAYS.quarter, label: t('tokenValidityDays', { count: 90 }) },
                            { value: TOKEN_VALIDITY_DAYS.year, label: t('tokenValidityDays', { count: 365 }) }
                        ]}
                    />
                )}
            />
            <p className="text-xs text-content-muted">{t('tokenFormValidityHint')}</p>
        </div>
    );
}

interface TokenFormState {
    readonly form: UseFormReturn<PlatformTokenFormValues>;
    readonly pending: boolean;
    readonly error: Error | null;
    readonly submit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

function useTokenForm(onCreated: (token: CreatedPlatformToken) => void): TokenFormState {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const create: ReturnType<typeof useCreatePlatformToken> = useCreatePlatformToken();
    const schema: ReturnType<typeof createPlatformTokenSchema> = useMemo(() => createPlatformTokenSchema(t), [t]);
    const form: UseFormReturn<PlatformTokenFormValues> = useForm<PlatformTokenFormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: DEFAULT_VALUES
    });
    const onValid = async (values: PlatformTokenFormValues): Promise<void> => {
        try {
            onCreated(await create.mutateAsync(toCreateTokenInput(values)));
        } catch {
            return;
        }
    };
    const handle: (event?: BaseSyntheticEvent) => Promise<void> = form.handleSubmit(onValid);
    const submit = (event: SyntheticEvent<HTMLFormElement>): void => {
        void handle(event);
    };
    return { form, pending: create.isPending, error: create.error, submit };
}

export function PlatformTokenForm({ onCreated, onClose }: PlatformTokenFormProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { form, pending, error, submit }: TokenFormState = useTokenForm(onCreated);
    return (
        <Modal
            title={t('tokenFormTitle')}
            description={t('tokenFormDescription')}
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t('formCancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={pending}>
                        {pending ? t('tokenFormSubmitting') : t('tokenFormSubmit')}
                    </Button>
                </>
            }
        >
            <form id={FORM_ID} noValidate className="flex flex-col gap-4" onSubmit={submit}>
                {error === null ? null : <Alert title={platformTokenErrorMessage(t, error)} />}
                <Field
                    label={t('tokenFormName')}
                    hint={t('tokenFormNameHint')}
                    error={form.formState.errors.name?.message}
                    {...form.register('name')}
                />
                <ValidityField form={form} />
            </form>
        </Modal>
    );
}
