import { useEffect, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { buttonVariants } from '@/shared/ui/button';
import { OfferSummary } from '@/shared/ui/offer-summary';
import { Loading, SkeletonText } from '@/shared/ui/skeleton';
import { useOfferPreview } from '../api/use-offer-preview.query';
import { offerErrorMessage, offerFailureCode } from '../lib/offer-error-message';
import type { OfferPreview } from '../types';
import { LegalNote } from './legal-note';
import { OfferRedeem } from './offer-redeem';
import { OfferSignIn } from './offer-sign-in';

export interface OfferBoxProps {
    readonly token: string;
    readonly onRedeemed: () => void;
}

function expiryText(t: UseTranslationResponse<'auth', undefined>['t'], offer: OfferPreview, locale: SupportedLocale): string | null {
    if (offer.expiresAt === null) {
        return null;
    }
    const date: string = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(offer.expiresAt)
    );
    return t('offerExpires', { date });
}

function OfferBody({ token, offer, onRedeemed }: OfferBoxProps & { readonly offer: OfferPreview }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const locale: SupportedLocale = useLocale();
    const { user } = useSession();
    const expiry: string | null = expiryText(t, offer, locale);
    return (
        <>
            <h1 className="mt-9 mb-4 text-3xl font-extrabold tracking-tight">{t('offerTitle')}</h1>
            <OfferSummary trial={offer.trial} rules={offer.rules} />
            {expiry === null ? null : <p className="mt-3 mb-0 text-sm text-content-muted">{expiry}</p>}
            <div className="mt-6">
                {user === null ? (
                    <OfferSignIn token={token} />
                ) : (
                    <OfferRedeem token={token} isOwner={user.role === 'owner'} email={user.email} onRedeemed={onRedeemed} />
                )}
            </div>
        </>
    );
}

function OfferFailure({ error }: { readonly error: Error }): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    return (
        <>
            <h1 className="mt-9 mb-4 text-3xl font-extrabold tracking-tight">{t('offerUnavailable')}</h1>
            <Alert title={offerErrorMessage(t, error)} />
            <Link to="/login" className={`${buttonVariants({ variant: 'secondary' })} mt-4`}>
                {t('offerLogin')}
            </Link>
        </>
    );
}

export function OfferBox({ token, onRedeemed }: OfferBoxProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const preview: UseQueryResult<OfferPreview> = useOfferPreview(token);

    useEffect((): void => {
        track('offer_viewed');
    }, []);

    useEffect((): void => {
        if (preview.error) {
            track('offer_failed', { code: offerFailureCode(preview.error) });
        }
    }, [preview.error]);

    return (
        <div className="w-full max-w-[380px]">
            <BrandLogo />
            {preview.isPending ? (
                <Loading label={t('offerLoading')} className="mt-9">
                    <SkeletonText lines={3} />
                </Loading>
            ) : null}
            {preview.error ? <OfferFailure error={preview.error} /> : null}
            {preview.data ? <OfferBody token={token} offer={preview.data} onRedeemed={onRedeemed} /> : null}
            <LegalNote />
        </div>
    );
}
