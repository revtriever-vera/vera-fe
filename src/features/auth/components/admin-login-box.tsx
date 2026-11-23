import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { GoogleSignIn } from './google-sign-in';
import { AdminRecoveryCodes } from './admin-recovery-codes';
import { AdminTotpChallenge } from './admin-totp-challenge';
import { AdminTotpEnrollment } from './admin-totp-enrollment';
import { useProviderAvailability, type ProviderAvailability } from '../lib/use-provider-availability';
import { useAdminSignIn, type AdminSignIn } from '../lib/use-admin-sign-in';
import { env } from '@/shared/config/env';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { adminTotpErrorMessage } from '../lib/admin-totp-error-message';

function GoogleStep({ login }: { readonly login: AdminSignIn }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const providers: ProviderAvailability = useProviderAvailability();
    return (
        <>
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('loginTitle')}</h1>
            <p className="mb-6 text-content-muted">{t('loginSubtitle')}</p>
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
        </>
    );
}

function StepBody({ login }: { readonly login: AdminSignIn }): ReactElement {
    const { step } = login;
    if (step.kind === 'challenge') {
        return <AdminTotpChallenge pending={login.pending} onSubmit={login.submitChallenge} onRestart={login.restart} />;
    }
    if (step.kind === 'enrollment') {
        return (
            <AdminTotpEnrollment
                enrollment={step.enrollment}
                pending={login.pending}
                onSubmit={login.submitEnrollment}
                onRestart={login.restart}
            />
        );
    }
    if (step.kind === 'recovery') {
        return <AdminRecoveryCodes codes={step.recoveryCodes} onSaved={login.finish} />;
    }
    return <GoogleStep login={login} />;
}

export function AdminLoginBox(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const login: AdminSignIn = useAdminSignIn();

    return (
        <div className="w-full max-w-[380px]">
            <BrandLogo />
            <StepBody login={login} />
            {login.error ? (
                <div className="mt-4">
                    <Alert title={adminTotpErrorMessage(t, login.error)} />
                </div>
            ) : null}
        </div>
    );
}
