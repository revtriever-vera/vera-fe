import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { env } from '@/shared/config/env';
import { Alert } from '@/shared/ui/alert';
import type { ProviderAvailability } from '../lib/use-provider-availability';
import type { SocialLogin } from '../lib/use-social-login';
import { FacebookSignIn } from './facebook-sign-in';
import { GoogleSignIn } from './google-sign-in';

interface SocialButtonsProps {
    readonly providers: ProviderAvailability;
    readonly login: SocialLogin;
}

export function SocialButtons({ providers, login }: SocialButtonsProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const noProvider: boolean = !providers.google && !providers.facebook;

    return (
        <>
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
        </>
    );
}
