import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { SessionUser } from '@/app/providers/session-context';
import { Avatar } from '@/shared/ui/avatar';
import { AccountSection } from './account-section';

export function ProfileCard({ user }: { readonly user: SessionUser }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const provider: string = user.loginProvider === 'google' ? t('providerGoogle') : t('providerFacebook');

    return (
        <AccountSection title={t('profileTitle')}>
            <div className="flex items-center gap-3">
                <Avatar name={user.name} className="size-11" />
                <dl className="grid min-w-0 gap-1 text-sm">
                    <div className="min-w-0">
                        <dt className="sr-only">{t('profileName')}</dt>
                        <dd className="truncate font-semibold text-content">{user.name}</dd>
                    </div>
                    <div className="min-w-0">
                        <dt className="sr-only">{t('profileEmail')}</dt>
                        <dd className="truncate text-content-muted">{user.email}</dd>
                    </div>
                </dl>
            </div>
            <p className="text-sm text-content">{t('profileProvider', { provider })}</p>
            <p className="text-2xs text-content-subtle">{t('profileNote')}</p>
        </AccountSection>
    );
}
