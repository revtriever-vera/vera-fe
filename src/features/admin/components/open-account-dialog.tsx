import { useMemo, type BaseSyntheticEvent, type ReactElement, type SyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { useOpenAccount } from '../api/use-open-account.mutation';
import { EMPTY_OPEN_ACCOUNT_FORM, toAccessInput } from '../lib/open-account-input';
import { openAccountErrorMessage } from '../lib/open-account-error-message';
import { createOpenAccountSchema, MAX_REASON_LENGTH, type OpenAccountFormValues } from '../schemas/open-account.schema';
import type { AccountAccess, AccountItem } from '../types';

export interface OpenAccountDialogProps {
    readonly account: AccountItem;
    readonly onOpened: (access: AccountAccess, reason: string) => void;
    readonly onClose: () => void;
}

const FORM_ID: string = 'open-account-form';

function LayerCheckbox({
    form,
    name,
    label,
    hint
}: {
    readonly form: UseFormReturn<OpenAccountFormValues>;
    readonly name: 'summary' | 'data';
    readonly label: string;
    readonly hint: string;
}): ReactElement {
    return (
        <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 size-4" {...form.register(name)} />
            <span className="flex flex-col">
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-content-muted">{hint}</span>
            </span>
        </label>
    );
}

function useOpenAccountForm(
    account: AccountItem,
    onOpened: OpenAccountDialogProps['onOpened']
): {
    form: UseFormReturn<OpenAccountFormValues>;
    open: ReturnType<typeof useOpenAccount>;
    submit: (event: SyntheticEvent<HTMLFormElement>) => void;
} {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const open: ReturnType<typeof useOpenAccount> = useOpenAccount();
    const schema: ReturnType<typeof createOpenAccountSchema> = useMemo(() => createOpenAccountSchema(t), [t]);
    const form: UseFormReturn<OpenAccountFormValues> = useForm<OpenAccountFormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: EMPTY_OPEN_ACCOUNT_FORM
    });
    const handle: (event?: BaseSyntheticEvent) => Promise<void> = form.handleSubmit(
        async (values: OpenAccountFormValues): Promise<void> => {
            try {
                const input: ReturnType<typeof toAccessInput> = toAccessInput(values);
                onOpened(await open.mutateAsync({ id: account.id, input }), input.reason);
            } catch {
                return;
            }
        }
    );
    const submit = (event: SyntheticEvent<HTMLFormElement>): void => {
        void handle(event);
    };
    return { form, open, submit };
}

function OpenAccountFields({
    form,
    error
}: {
    readonly form: UseFormReturn<OpenAccountFormValues>;
    readonly error: Error | null;
}): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <>
            {error === null ? null : <Alert title={openAccountErrorMessage(t, error)} />}
            <Field
                label={t('openReasonLabel')}
                hint={t('openReasonHint')}
                maxLength={MAX_REASON_LENGTH}
                error={form.formState.errors.reason?.message}
                {...form.register('reason')}
            />
            <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-semibold">{t('openLayersLabel')}</legend>
                <LayerCheckbox form={form} name="summary" label={t('openLayerSummary')} hint={t('openLayerSummaryHint')} />
                <LayerCheckbox form={form} name="data" label={t('openLayerData')} hint={t('openLayerDataHint')} />
                {form.formState.errors.summary?.message === undefined ? null : (
                    <p role="alert" className="text-xs text-critical">
                        {form.formState.errors.summary.message}
                    </p>
                )}
            </fieldset>
            <Alert tone="caution" title={t('openAuditNotice')} />
        </>
    );
}

function DialogFooter({ pending, onClose }: { readonly pending: boolean; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <>
            <Button type="button" variant="secondary" onClick={onClose}>
                {t('formCancel')}
            </Button>
            <Button type="submit" form={FORM_ID} loading={pending}>
                {t(pending ? 'openSubmitting' : 'openSubmit')}
            </Button>
        </>
    );
}

export function OpenAccountDialog({ account, onOpened, onClose }: OpenAccountDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { form, open, submit }: ReturnType<typeof useOpenAccountForm> = useOpenAccountForm(account, onOpened);
    return (
        <Modal
            title={t('openTitle', { name: account.name })}
            description={t('openDescription')}
            onClose={onClose}
            footer={<DialogFooter pending={open.isPending} onClose={onClose} />}
        >
            <form id={FORM_ID} noValidate className="flex flex-col gap-4" onSubmit={submit}>
                <OpenAccountFields form={form} error={open.error} />
            </form>
        </Modal>
    );
}
