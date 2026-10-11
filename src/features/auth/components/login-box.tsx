import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { env } from '@/shared/config/env';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { authErrorMessage } from '../lib/auth-error-message';
import { useProviderAvailability, type ProviderAvailability } from '../lib/use-provider-availability';
import { useSocialLogin, type SocialLogin } from '../lib/use-social-login';
import { FacebookSignIn } from './facebook-sign-in';
import { GoogleSignIn } from './google-sign-in';
import { LegalNote } from './legal-note';

export function LoginBox({ accountDeleted = false }: { readonly accountDeleted?: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const providers: ProviderAvailability = useProviderAvailability();
    const login: SocialLogin = useSocialLogin();
    const noProvider: boolean = !providers.google && !providers.facebook;

    return (
        <div className="w-full max-w-[380px]">
            <BrandLogo />
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('title')}</h1>
            <p className="mb-6 text-content-muted">{t('subtitle')}</p>
            <div className="flex flex-col gap-2.5">
                {accountDeleted ? <Alert tone="positive" title={t('accountDeleted')} /> : null}
                {login.error ? <Alert title={authErrorMessage(t, login.error)} /> : null}
                {noProvider ? <Alert tone="caution" title={t('unavailableTitle')} detail={t('unavailableDetail')} /> : null}
                {providers.google ? (
                    <GoogleSignIn
                        clientId={env.VITE_GOOGLE_CLIENT_ID}
                        onCredential={login.loginWithGoogle}
                        onUnavailable={providers.markGoogleBlocked}
                        disabled={login.pending}
                    />
                ) : null}
                {providers.facebook ? (
                    <FacebookSignIn
                        appId={env.VITE_FACEBOOK_APP_ID}
                        onAccessToken={login.loginWithFacebook}
                        onUnavailable={providers.markFacebookBlocked}
                        disabled={login.pending}
                    />
                ) : null}
            </div>
            <LegalNote />
        </div>
    );
}
