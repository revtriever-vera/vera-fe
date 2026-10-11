import { useState, type ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import type { SessionUser } from '@/app/providers/session-context';
import { track } from '@/shared/lib/analytics';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { AccountSection } from './account-section';
import { DeleteAccountModal } from './delete-account-modal';

export function DeleteAccountCard({ user }: { readonly user: SessionUser }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const { discardSession } = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();
    const [open, setOpen] = useState<boolean>(false);

    const handleDeleted = (): void => {
        track('account_deleted');
        discardSession();
        void navigate({ to: '/login', search: { deleted: '1' }, replace: true });
    };
    const close = (): void => {
        setOpen(false);
    };

    return (
        <AccountSection title={t('deleteTitle')} description={t('deleteDescription')} tone="critical">
            {user.role === 'owner' ? (
                <div>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={(): void => {
                            track('account_delete_opened');
                            setOpen(true);
                        }}
                    >
                        {t('deleteOpen')}
                    </Button>
                </div>
            ) : (
                <Alert tone="caution" title={t('deleteOwnerOnly')} />
            )}
            {open ? <DeleteAccountModal email={user.email} onClose={close} onDeleted={handleDeleted} /> : null}
        </AccountSection>
    );
}
