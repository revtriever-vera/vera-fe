import { Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import type { SessionUser } from '@/app/providers/session-context';
import { track } from '@/shared/lib/analytics';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { Button } from '@/shared/ui/button';
import { cancelsPremiumOnDelete } from '../lib/live-subscription';
import { DataRow } from './data-row';
import { DeleteAccountModal } from './delete-account-modal';

export function DeleteAccountCard({ user }: { readonly user: SessionUser }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const { discardSession } = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();
    const premium: boolean = cancelsPremiumOnDelete(useBilling());
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
        <DataRow icon={Trash2} title={t('deleteTitle')} description={t(premium ? 'deleteDescriptionPremium' : 'deleteDescription')}>
            <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={(): void => {
                    track('account_delete_opened');
                    setOpen(true);
                }}
            >
                {t('deleteOpen')}
            </Button>
            {open ? <DeleteAccountModal email={user.email} premium={premium} onClose={close} onDeleted={handleDeleted} /> : null}
        </DataRow>
    );
}
