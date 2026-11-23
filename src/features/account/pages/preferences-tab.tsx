import type { ReactElement, ReactNode } from 'react';
import { useSession } from '@/app/providers/session-provider';
import { LanguageCard } from '../components/language-card';
import { ProfileCard } from '../components/profile-card';

export interface PreferencesTabProps {
    readonly noticesSlot?: ReactNode;
}

export function PreferencesTab({ noticesSlot = null }: PreferencesTabProps): ReactElement | null {
    const { user } = useSession();

    if (user === null) {
        return null;
    }

    return (
        <>
            <LanguageCard />
            {noticesSlot}
            <ProfileCard user={user} />
        </>
    );
}
