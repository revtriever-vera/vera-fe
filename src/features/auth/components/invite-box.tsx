import { useEffect, useState, type ReactElement } from 'react';
import { Navigate, useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import { useToast } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { AuthProviderName } from '@/shared/lib/analytics/events';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';
import { Loading, SkeletonText } from '@/shared/ui/skeleton';
import { useInvitePreview } from '../api/use-invite-preview.query';
import { inviteErrorMessage, inviteFailureCode } from '../lib/invite-error-message';
import { inviteRoleKey } from '../lib/invite-role-key';
import { useProviderAvailability, type ProviderAvailability } from '../lib/use-provider-availability';
import { useSocialLogin, type SocialLogin } from '../lib/use-social-login';
import type { InvitePreview } from '../types';
import { LegalNote } from './legal-note';
import { SocialButtons } from './social-buttons';

interface InviteSignInProps {
    readonly token: string;
    readonly invite: InvitePreview;
}

function InviteSignIn({ token, invite }: InviteSignInProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const toast = useToast();
    const navigate: UseNavigateResult<string> = useNavigate();
    const providers: ProviderAvailability = useProviderAvailability();
    const [failedProvider, setFailedProvider] = useState<AuthProviderName | null>(null);
    const login: SocialLogin = useSocialLogin({
        inviteToken: token,
        onSignedIn: (_completed, provider): void => {
            track('invite_accepted', { provider });
            toast.show({ tone: 'positive', title: t('inviteJoined', { name: invite.inviterName }) });
            void navigate({ to: '/', replace: true });
        },
        onFailed: (failure: Error, provider: AuthProviderName): void => {
            setFailedProvider(provider);
            track('invite_failed', { code: inviteFailureCode(failure) });
        }
    });

    return (
        <div className="flex flex-col gap-2.5">
            {login.error ? <Alert title={inviteErrorMessage(t, login.error, invite.emailMasked, failedProvider)} /> : null}
            <SocialButtons providers={providers} login={login} />
        </div>
    );
}

function SwitchAccount({ onSwitch }: { readonly onSwitch: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');

    return (
        <div className="flex flex-col items-start gap-3">
            <Alert tone="caution" title={t('inviteOtherAccount')} />
            <Button type="button" onClick={onSwitch}>
                {t('inviteSwitchAccount')}
            </Button>
        </div>
    );
}

function InviteBody({ token, invite }: InviteSignInProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const { user, signOut } = useSession();

    if (user?.companyName === invite.accountName) {
        return <Navigate to="/" replace />;
    }
    return (
        <>
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('inviteTitle', { name: invite.inviterName })}</h1>
            <p className="text-content">{t(inviteRoleKey(invite.role))}</p>
            <p className="mt-2 mb-6 text-content-muted">{t('inviteSignInWith', { email: invite.emailMasked })}</p>
            {user === null ? <InviteSignIn token={token} invite={invite} /> : <SwitchAccount onSwitch={signOut} />}
        </>
    );
}

function InviteFailure({ error }: { readonly error: Error }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');

    return (
        <>
            <h1 className="mt-9 mb-4 text-3xl font-extrabold tracking-tight">{t('inviteUnavailable')}</h1>
            <Alert title={inviteErrorMessage(t, error, '')} />
        </>
    );
}

export function InviteBox({ token }: { readonly token: string }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const preview: UseQueryResult<InvitePreview> = useInvitePreview(token);

    useEffect((): void => {
        track('invite_viewed');
    }, []);

    useEffect((): void => {
        if (preview.error) {
            track('invite_failed', { code: inviteFailureCode(preview.error) });
        }
    }, [preview.error]);

    return (
        <div className="w-full max-w-[380px]">
            <BrandLogo />
            {preview.isPending ? (
                <Loading label={t('inviteLoading')} className="mt-9">
                    <SkeletonText lines={3} />
                </Loading>
            ) : null}
            {preview.error ? <InviteFailure error={preview.error} /> : null}
            {preview.data ? <InviteBody token={token} invite={preview.data} /> : null}
            <LegalNote />
        </div>
    );
}
