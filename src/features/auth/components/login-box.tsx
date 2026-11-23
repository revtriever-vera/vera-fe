import { useEffect, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { authErrorMessage } from '../lib/auth-error-message';
import { useProviderAvailability, type ProviderAvailability } from '../lib/use-provider-availability';
import { useSocialLogin, type SocialLogin } from '../lib/use-social-login';
import { LegalNote } from './legal-note';
import { SocialButtons } from './social-buttons';

interface LoginBoxProps {
    readonly accountDeleted?: boolean;
    readonly accountLeft?: boolean;
}

export function LoginBox({ accountDeleted = false, accountLeft = false }: LoginBoxProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const providers: ProviderAvailability = useProviderAvailability();
    const login: SocialLogin = useSocialLogin();

    useEffect((): void => {
        track('auth_screen_viewed');
    }, []);

    return (
        <div className="w-full max-w-[380px]">
            <BrandLogo />
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('title')}</h1>
            <p className="mb-6 text-content-muted">{t('subtitle')}</p>
            <div className="flex flex-col gap-2.5">
                {accountDeleted ? <Alert tone="positive" title={t('accountDeleted')} /> : null}
                {accountLeft ? <Alert tone="positive" title={t('accountLeft')} /> : null}
                {login.error ? <Alert title={authErrorMessage(t, login.error)} /> : null}
                <SocialButtons providers={providers} login={login} />
            </div>
            <LegalNote />
        </div>
    );
}
