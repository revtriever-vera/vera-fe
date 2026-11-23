import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { offerErrorMessage } from '../lib/offer-error-message';
import { useOfferSignInOutcome, type OfferOutcomeHandler } from '../lib/use-offer-redemption';
import { useProviderAvailability, type ProviderAvailability } from '../lib/use-provider-availability';
import { useSocialLogin, type SocialLogin } from '../lib/use-social-login';
import { SocialButtons } from './social-buttons';

export function OfferSignIn({ token }: { readonly token: string }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const providers: ProviderAvailability = useProviderAvailability();
    const outcome: OfferOutcomeHandler = useOfferSignInOutcome();
    const login: SocialLogin = useSocialLogin({ offerToken: token, onSignedIn: outcome.onSignedIn });
    return (
        <div className="flex flex-col gap-2.5">
            <p className="m-0 mb-2 text-content-muted">{t('offerSignIn')}</p>
            {login.error ? <Alert title={offerErrorMessage(t, login.error)} /> : null}
            <SocialButtons providers={providers} login={login} />
        </div>
    );
}
