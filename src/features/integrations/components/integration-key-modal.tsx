import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { CopyField } from '@/shared/ui/copy-field';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { INTEGRATION_FIELDS, lastCharacters, type IntegrationField } from '../lib/integration-fields';
import { useIntegrationForm, type IntegrationForm } from '../lib/use-integration-form';
import type { IntegrationItem, IntegrationKind, IntegrationsView } from '../types';

const FORM_ID: string = 'integration-key-form';

export interface IntegrationKeyModalProps {
    readonly kind: IntegrationKind;
    readonly item: IntegrationItem | undefined;
    readonly view: IntegrationsView;
    readonly onClose: () => void;
}

function CallbackUrl({ kind, view }: { readonly kind: IntegrationKind; readonly view: IntegrationsView }): ReactElement | null {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    if (kind === 'llm') {
        return null;
    }
    const value: string = kind === 'whatsapp' ? view.webhookUrl : view.googleRedirectUri;
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-content">{t(`kinds.${kind}.urlLabel`)}</span>
            <CopyField value={value} copyLabel={t('copyUrl')} />
        </div>
    );
}

function KeyFields({
    kind,
    item,
    form
}: {
    readonly kind: IntegrationKind;
    readonly item: IntegrationItem | undefined;
    readonly form: IntegrationForm['form'];
}): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const tail: string | null = lastCharacters(item?.hint ?? null);
    const firstSecret: string | undefined = INTEGRATION_FIELDS[kind].find((field: IntegrationField): boolean => field.secret)?.name;
    return (
        <>
            {INTEGRATION_FIELDS[kind].map((field: IntegrationField): ReactElement => (
                <Field
                    key={field.name}
                    label={t(field.labelKey)}
                    type={field.secret ? 'password' : 'text'}
                    autoComplete="off"
                    spellCheck={false}
                    hint={field.name === firstSecret && tail !== null ? t('currentHint', { tail }) : undefined}
                    error={form.formState.errors[field.name]?.message}
                    {...form.register(field.name)}
                />
            ))}
        </>
    );
}

export function IntegrationKeyModal({ kind, item, view, onClose }: IntegrationKeyModalProps): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const { form, busy, failure, submit }: IntegrationForm = useIntegrationForm(kind, item, onClose);
    return (
        <Modal
            title={t(`kinds.${kind}.title`)}
            description={t('modalNote', { note: t(`kinds.${kind}.note`) })}
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={busy}>
                        {busy ? t('testing') : t('saveAndTest')}
                    </Button>
                </>
            }
        >
            <form id={FORM_ID} noValidate onSubmit={(event): void => void submit(event)} className="flex flex-col gap-3">
                <CallbackUrl kind={kind} view={view} />
                <KeyFields kind={kind} item={item} form={form} />
                {failure === null ? null : <Alert title={failure} />}
            </form>
        </Modal>
    );
}
