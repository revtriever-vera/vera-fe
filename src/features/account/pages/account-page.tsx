import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import type { SessionUser } from '@/app/providers/session-context';
import { DeleteAccountCard } from '../components/delete-account-card';
import { ExportCard } from '../components/export-card';
import { LanguageCard } from '../components/language-card';
import { ProfileCard } from '../components/profile-card';

export function AccountPage(): ReactElement | null {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const { user } = useSession();

    if (user === null) {
        return null;
    }
    const current: SessionUser = user;

    return (
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6 min-[861px]:py-10">
            <h1 className="text-xl font-semibold tracking-tight text-content">{t('title')}</h1>
            <ProfileCard user={current} />
            <LanguageCard />
            <ExportCard />
            <DeleteAccountCard user={current} />
        </main>
    );
}
