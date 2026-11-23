import type { ReactElement } from 'react';
import { useSession } from '@/app/providers/session-provider';
import { LanguageCard } from '../components/language-card';
import { ProfileCard } from '../components/profile-card';

export function PreferencesTab(): ReactElement | null {
    const { user } = useSession();

    if (user === null) {
        return null;
    }

    return (
        <>
            <LanguageCard />
            <ProfileCard user={user} />
        </>
    );
}
