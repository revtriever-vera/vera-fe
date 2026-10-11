import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';
import { FACEBOOK_SCOPE, loadFacebookSdk, type FacebookLoginResponse, type FacebookSdk } from '../lib/facebook-sdk';
import { FacebookLogo } from './facebook-logo';

export interface FacebookSignInProps {
    readonly appId: string;
    readonly onAccessToken: (accessToken: string) => void;
    readonly onUnavailable: () => void;
    readonly disabled?: boolean;
}

function useFacebookSdk(appId: string, locale: string, onUnavailable: () => void): FacebookSdk | null {
    const [sdk, setSdk] = useState<FacebookSdk | null>(null);
    useEffect((): (() => void) => {
        let active: boolean = true;
        loadFacebookSdk(appId, locale)
            .then((loaded: FacebookSdk): void => {
                if (active) {
                    setSdk(loaded);
                }
            })
            .catch((): void => {
                if (active) {
                    onUnavailable();
                }
            });
        return (): void => {
            active = false;
        };
    }, [appId, locale, onUnavailable]);
    return sdk;
}

export function FacebookSignIn({ appId, onAccessToken, onUnavailable, disabled = false }: FacebookSignInProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const locale: string = useLocale();
    const sdk: FacebookSdk | null = useFacebookSdk(appId, locale, onUnavailable);

    const handleClick = (): void => {
        sdk?.login(
            (response: FacebookLoginResponse): void => {
                if (response.authResponse !== null) {
                    onAccessToken(response.authResponse.accessToken);
                }
            },
            { scope: FACEBOOK_SCOPE }
        );
    };

    return (
        <Button
            type="button"
            size="lg"
            block
            loading={sdk === null}
            disabled={disabled}
            onClick={handleClick}
            className="h-12 border border-facebook bg-facebook text-[15px] text-accent-contrast"
        >
            {sdk === null ? null : <FacebookLogo />}
            {t('continueWithFacebook')}
        </Button>
    );
}
