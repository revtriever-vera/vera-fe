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
    readonly showFacebook?: boolean;
}

export function SocialButtons({ providers, login, showFacebook = true }: SocialButtonsProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const facebookVisible: boolean = showFacebook && providers.facebook;
    const noProvider: boolean = !providers.google && !facebookVisible;

    return (
        <>
            {noProvider && providers.configured ? (
                <Alert tone="caution" title={t('unavailableTitle')} detail={t('unavailableDetail')} />
            ) : null}
            {noProvider && !providers.configured ? (
                <Alert tone="caution" title={t('notConfiguredTitle')} detail={t('notConfiguredDetail')} />
            ) : null}
            {providers.google ? (
                <GoogleSignIn
                    clientId={env.VITE_GOOGLE_CLIENT_ID}
                    onCredential={login.loginWithGoogle}
                    onUnavailable={providers.markGoogleBlocked}
                    disabled={login.pending}
                />
            ) : null}
            {facebookVisible ? (
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
