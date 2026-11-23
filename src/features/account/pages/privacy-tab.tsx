import type { ReactElement } from 'react';
import { RoleGate } from '@/app/providers/role-gate';
import { useSession } from '@/app/providers/session-provider';
import { DeleteAccountCard } from '../components/delete-account-card';
import { ExportCard } from '../components/export-card';

export function PrivacyTab(): ReactElement | null {
    const { user } = useSession();

    if (user === null) {
        return null;
    }

    return (
        <>
            <RoleGate min="owner">
                <ExportCard />
            </RoleGate>
            <DeleteAccountCard user={user} />
        </>
    );
}
