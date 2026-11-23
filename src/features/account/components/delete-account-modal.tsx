import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Modal } from '@/shared/ui/modal';
import { accountErrorMessage } from '../lib/account-error-message';
import { useDeleteAccountForm, type DeleteAccountForm } from '../lib/use-delete-account-form';
import { ExportButton } from './export-button';

const FORM_ID: string = 'delete-account-form';

interface DeleteAccountModalProps {
    readonly email: string;
    readonly premium: boolean;
    readonly onClose: () => void;
    readonly onDeleted: () => void;
}

function ErasureNotice({ premium }: { readonly premium: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');

    return (
        <>
            <p className="text-sm text-content">{t(premium ? 'deleteModalBodyPremium' : 'deleteModalBody')}</p>
            <div className="flex flex-col items-start gap-2 rounded-control bg-surface-muted p-3 text-sm text-content-muted">
                <p>{t('deleteExportInvite')}</p>
                <ExportButton />
            </div>
        </>
    );
}

export function DeleteAccountModal({ email, premium, onClose, onDeleted }: DeleteAccountModalProps): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const { form, matches, busy, failure, submit }: DeleteAccountForm = useDeleteAccountForm(t, email, onDeleted);

    return (
        <Modal
            title={t('deleteModalTitle')}
            onClose={onClose}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        {t('deleteCancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} variant="danger" disabled={!matches} loading={busy}>
                        {busy ? t('deleteSubmitting') : t('deleteSubmit')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <ErasureNotice premium={premium} />
                <form id={FORM_ID} noValidate onSubmit={(event): void => void submit(event)} className="flex flex-col gap-3">
                    <Field
                        label={t('deleteConfirmLabel', { word: t('deleteWord') })}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        error={form.formState.errors.confirmation?.message}
                        {...form.register('confirmation')}
                    />
                    {failure === null ? null : <Alert title={accountErrorMessage(t, failure, 'delete')} />}
                </form>
            </div>
        </Modal>
    );
}
