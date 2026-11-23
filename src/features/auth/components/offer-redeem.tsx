import type { ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { useRedeemOffer } from '../api/use-redeem-offer.mutation';
import { offerErrorMessage, offerFailureCode } from '../lib/offer-error-message';
import type { RedeemedOffer } from '../types';

export interface OfferRedeemProps {
    readonly token: string;
    readonly isOwner: boolean;
    readonly email: string;
    readonly onRedeemed: () => void;
}

export function OfferRedeem({ token, isOwner, email, onRedeemed }: OfferRedeemProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const toast: ToastApi = useToast();
    const navigate: UseNavigateResult<string> = useNavigate();
    const redeem: UseMutationResult<RedeemedOffer, Error, string> = useRedeemOffer();
    if (!isOwner) {
        return <Alert tone="caution" title={t('offerOwnerOnly')} />;
    }
    const submit = (): void => {
        redeem.mutate(token, {
            onSuccess: (): void => {
                track('offer_redeemed', { via: 'session' });
                onRedeemed();
                toast.show({ tone: 'positive', title: t('offerRedeemed') });
                void navigate({ to: '/settings/$tab', params: { tab: 'plan' }, replace: true });
            },
            onError: (error: Error): void => {
                track('offer_failed', { code: offerFailureCode(error) });
            }
        });
    };
    return (
        <div className="flex flex-col items-start gap-3">
            <p className="m-0 text-sm text-content-muted">{t('offerRedeemAs', { email })}</p>
            {redeem.error ? <Alert title={offerErrorMessage(t, redeem.error)} /> : null}
            <Button loading={redeem.isPending} disabled={redeem.isPending} onClick={submit}>
                {redeem.isPending ? t('offerRedeeming') : t('offerRedeem')}
            </Button>
        </div>
    );
}
