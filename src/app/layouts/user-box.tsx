import type { ReactElement } from 'react';
import { Link, useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import type { SessionContext, SessionUser } from '@/app/providers/session-context';
import { Avatar } from '@/shared/ui/avatar';

const ACCOUNT_PATH: string = '/account';

function providerLabel(user: SessionUser, t: UseTranslationResponse<'common', undefined>['t']): string {
    const provider: string = user.loginProvider === 'google' ? t('providerGoogle') : t('providerFacebook');
    return t('viaProvider', { provider });
}

export function UserBox(): ReactElement | null {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const { user, signOut }: SessionContext = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();

    if (user === null) {
        return null;
    }

    const handleSignOut = (): void => {
        signOut();
        void navigate({ to: '/login', replace: true });
    };

    return (
        <div className="flex items-center gap-2.5 rounded-card border border-border p-2.5" role="group" aria-label={t('userBox')}>
            <Avatar name={user.name} className="size-[34px]" />
            <Link
                to={ACCOUNT_PATH}
                aria-label={t('openAccount')}
                className="min-w-0 flex-1 rounded-control py-0.5 text-left outline-offset-2 hover:text-accent-strong"
            >
                <b className="block truncate text-[13.5px]">{user.name}</b>
                <span className="block text-[11.5px] text-content-muted">{providerLabel(user, t)}</span>
            </Link>
            <button
                type="button"
                aria-label={t('signOut')}
                title={t('signOut')}
                onClick={handleSignOut}
                className="grid size-11 shrink-0 place-items-center rounded-control text-content-muted transition-colors hover:bg-critical-soft hover:text-critical"
            >
                <LogOut className="size-[18px]" aria-hidden="true" />
            </button>
        </div>
    );
}
