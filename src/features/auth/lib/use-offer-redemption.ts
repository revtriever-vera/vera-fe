import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { CompletedSignIn } from '../api/complete-sign-in';
import { offerReasonMessage } from './offer-error-message';

export interface OfferOutcomeHandler {
    readonly onSignedIn: (completed: CompletedSignIn) => void;
}

export function useOfferSignInOutcome(): OfferOutcomeHandler {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const toast: ToastApi = useToast();
    const navigate: UseNavigateResult<string> = useNavigate();
    return {
        onSignedIn: (completed: CompletedSignIn): void => {
            const offer: CompletedSignIn['offer'] = completed.offer;
            if (offer === null) {
                void navigate({ to: '/', replace: true });
                return;
            }
            if (offer.redeemed) {
                track('offer_redeemed', { via: 'signup' });
                toast.show({ tone: 'positive', title: t('offerRedeemed') });
                void navigate({ to: completed.isNewAccount ? '/' : '/settings/$tab', params: { tab: 'plan' }, replace: true });
                return;
            }
            const code: string = offer.reason ?? 'unknown';
            track('offer_failed', { code });
            toast.show({ tone: 'caution', title: t('offerNotRedeemed', { reason: offerReasonMessage(t, code) }) });
            void navigate({ to: '/', replace: true });
        }
    };
}
