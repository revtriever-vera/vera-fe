import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { RoleGate } from '@/app/providers/role-gate';
import { useSession } from '@/app/providers/session-provider';
import { Alert } from '@/shared/ui/alert';
import { AccountSection } from '../components/account-section';
import { DeleteAccountCard } from '../components/delete-account-card';
import { ExportCard } from '../components/export-card';
import { SummariesSlot } from '../components/summaries-slot';

export function PrivacyTab(): ReactElement | null {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const { user } = useSession();

    if (user === null) {
        return null;
    }

    return (
        <>
            <SummariesSlot />
            <AccountSection title={t('dataTitle')} description={t('dataDescription')}>
                <RoleGate min="owner" fallback={<Alert tone="caution" title={t('dataOwnerOnly')} />}>
                    <ExportCard />
                    <DeleteAccountCard user={user} />
                </RoleGate>
            </AccountSection>
        </>
    );
}
