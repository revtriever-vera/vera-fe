import type { paths } from '@/shared/lib/api/schema';

export type SessionIdentity = paths['/auth/me']['get']['responses']['200']['content']['application/json'];
export type GoogleLoginResponse = paths['/auth/google']['post']['responses']['200']['content']['application/json'];
export type LoginSession = Extract<GoogleLoginResponse, { outcome: 'authenticated' }>;
export type TotpEnrollment = paths['/auth/totp/enroll']['post']['responses']['200']['content']['application/json'];
export type TotpActivation = paths['/auth/totp/activate']['post']['responses']['200']['content']['application/json'];
export type TotpVerification = paths['/auth/totp/verify']['post']['responses']['200']['content']['application/json'];
export type LoginProvider = SessionIdentity['loginProvider'];
export type SessionRole = SessionIdentity['role'];
export type SessionLocale = SessionIdentity['locale'];
export type InvitePreview = paths['/invites/{token}']['get']['responses']['200']['content']['application/json'];
export type OfferPreview = paths['/signup-links/{token}']['get']['responses']['200']['content']['application/json'];
export type RedeemedOffer = paths['/billing/offer/redeem']['post']['responses']['200']['content']['application/json'];
export type OfferOutcome = NonNullable<LoginSession['offer']>;
