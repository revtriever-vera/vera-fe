import { useMemo, type ReactElement } from 'react';
import { useForm, useWatch, type FieldErrors, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { EXAMPLE_CLIENT_ID, EXAMPLE_CLIENT_SECRET, EXAMPLE_ITEM_IDS } from '../lib/dev-example';
import { parseItemIds, type ParsedItemIds } from '../lib/parse-item-ids';
import {
    useCredentialsFlow,
    type CredentialsFlow,
    type CredentialsFlowCallbacks,
    type FlowAlert,
    type FlowPhase
} from '../lib/use-credentials-flow';
import { createCredentialsSchema, type CredentialsFormInput, type CredentialsFormMode } from '../schemas/credentials.schema';
import type { SpendingConnectionsKey } from '../types';
import { ItemIdsField } from './item-ids-field';

export interface CredentialsFormProps extends CredentialsFlowCallbacks {
    readonly mode: CredentialsFormMode;
    readonly onCancel: (() => void) | null;
}

interface AlertCopy {
    readonly tone: 'caution' | 'critical';
    readonly title: SpendingConnectionsKey;
    readonly detail: SpendingConnectionsKey | null;
}

const ALERT_COPY: Readonly<Record<FlowAlert, AlertCopy>> = {
    unavailable: {
        tone: 'caution',
        title: 'credentials.errors.providerUnavailableTitle',
        detail: 'credentials.errors.providerUnavailableDetail'
    },
    disabled: { tone: 'critical', title: 'credentials.errors.providerDisabledTitle', detail: 'credentials.errors.providerDisabledDetail' },
    invalid: { tone: 'critical', title: 'credentials.errors.invalidCredentials', detail: null }
};

const SUBMIT_KEYS: Readonly<Record<CredentialsFormMode, SpendingConnectionsKey>> = {
    full: 'credentials.submit',
    rotate: 'credentials.rotateSubmit',
    items: 'credentials.addSubmit'
};

const PHASE_KEYS: Readonly<Record<Exclude<FlowPhase, 'idle'>, SpendingConnectionsKey>> = {
    testing: 'credentials.testing',
    connecting: 'credentials.connecting'
};

function FlowAlertView({ kind }: { readonly kind: FlowAlert }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const copy: AlertCopy = ALERT_COPY[kind];
    return <Alert tone={copy.tone} title={t(copy.title)} detail={copy.detail === null ? undefined : t(copy.detail)} />;
}

function submitKey(mode: CredentialsFormMode, phase: FlowPhase): SpendingConnectionsKey {
    return phase === 'idle' ? SUBMIT_KEYS[mode] : PHASE_KEYS[phase];
}

function CredentialFields({ form }: { readonly form: UseFormReturn<CredentialsFormInput> }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <>
            <Field
                label={t('credentials.clientId')}
                autoComplete="off"
                spellCheck={false}
                placeholder={t('credentials.clientIdPlaceholder')}
                hint={t('credentials.clientIdHint')}
                error={form.formState.errors.clientId?.message}
                {...form.register('clientId')}
            />
            <Field
                label={t('credentials.clientSecret')}
                type="password"
                autoComplete="new-password"
                spellCheck={false}
                hint={t('credentials.clientSecretHint')}
                error={form.formState.errors.clientSecret?.message}
                {...form.register('clientSecret')}
            />
        </>
    );
}

const FIELD_ORDER: readonly (keyof CredentialsFormInput)[] = ['clientId', 'clientSecret', 'itemIds'];

function focusFirstError(form: UseFormReturn<CredentialsFormInput>): (errors: FieldErrors<CredentialsFormInput>) => void {
    return (errors: FieldErrors<CredentialsFormInput>): void => {
        const first: keyof CredentialsFormInput | undefined = FIELD_ORDER.find(
            (name: keyof CredentialsFormInput): boolean => errors[name] !== undefined
        );
        if (first !== undefined) {
            form.setFocus(first);
        }
    };
}

function ExampleButton({
    form,
    disabled
}: {
    readonly form: UseFormReturn<CredentialsFormInput>;
    readonly disabled: boolean;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const fill = (): void => {
        form.setValue('clientId', EXAMPLE_CLIENT_ID);
        form.setValue('clientSecret', EXAMPLE_CLIENT_SECRET);
        form.setValue('itemIds', EXAMPLE_ITEM_IDS);
    };
    return (
        <Button type="button" variant="ghost" onClick={fill} disabled={disabled}>
            {t('credentials.fillExample')}
        </Button>
    );
}

export function CredentialsForm({ mode, onCancel, ...callbacks }: CredentialsFormProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const schema: z.ZodType<CredentialsFormInput> = useMemo(() => createCredentialsSchema(t, mode), [t, mode]);
    const form: UseFormReturn<CredentialsFormInput> = useForm<CredentialsFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        shouldFocusError: false,
        defaultValues: { clientId: '', clientSecret: '', itemIds: '' }
    });
    const flow: CredentialsFlow = useCredentialsFlow(form, mode, callbacks);
    const itemIds: string = useWatch({ control: form.control, name: 'itemIds' });
    const parsed: ParsedItemIds = useMemo((): ParsedItemIds => parseItemIds(itemIds), [itemIds]);
    const busy: boolean = flow.phase !== 'idle' || form.formState.isSubmitting;
    return (
        <form
            noValidate
            className="flex flex-col gap-3"
            onSubmit={(event): void => void form.handleSubmit(flow.run, focusFirstError(form))(event)}
        >
            {mode === 'items' ? null : <CredentialFields form={form} />}
            {mode === 'rotate' ? null : (
                <ItemIdsField registration={form.register('itemIds')} parsed={parsed} error={form.formState.errors.itemIds?.message} />
            )}
            {flow.alert === null ? null : <FlowAlertView kind={flow.alert} />}
            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" loading={busy}>
                    {t(submitKey(mode, flow.phase))}
                </Button>
                {onCancel === null ? null : (
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                        {t('credentials.cancel')}
                    </Button>
                )}
                {import.meta.env.DEV && mode === 'full' ? <ExampleButton form={form} disabled={busy} /> : null}
            </div>
        </form>
    );
}
