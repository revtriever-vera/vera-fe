import type { ReactElement } from 'react';
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
            <ExportCard />
            <DeleteAccountCard user={user} />
        </>
    );
}
