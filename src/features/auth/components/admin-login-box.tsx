import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { GoogleSignIn } from './google-sign-in';
import { useProviderAvailability, type ProviderAvailability } from '../lib/use-provider-availability';
import { useAdminSignIn, type AdminSignIn } from '../lib/use-admin-sign-in';
import { env } from '@/shared/config/env';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { adminLoginErrorMessage } from '../lib/admin-login-error-message';

export function AdminLoginBox(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const providers: ProviderAvailability = useProviderAvailability();
    const login: AdminSignIn = useAdminSignIn();

    return (
        <div className="w-full max-w-[380px]">
            <BrandLogo />
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('loginTitle')}</h1>
            <p className="mb-6 text-content-muted">{t('loginSubtitle')}</p>
            <div className="flex flex-col gap-2.5">
                {login.error ? <Alert title={adminLoginErrorMessage(t, login.error)} /> : null}
                {providers.google ? (
                    <GoogleSignIn
                        clientId={env.VITE_GOOGLE_CLIENT_ID}
                        onCredential={login.loginWithGoogle}
                        onUnavailable={providers.markGoogleBlocked}
                        disabled={login.pending}
                    />
                ) : (
                    <Alert tone="caution" title={t('loginUnavailableTitle')} detail={t('loginUnavailableDetail')} />
                )}
            </div>
        </div>
    );
}
