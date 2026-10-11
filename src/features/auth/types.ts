import type { paths } from '@/shared/lib/api/schema';

export type SessionIdentity = paths['/auth/me']['get']['responses']['200']['content']['application/json'];
export type LoginSession = paths['/auth/google']['post']['responses']['200']['content']['application/json'];
export type LoginProvider = SessionIdentity['loginProvider'];
export type SessionRole = SessionIdentity['role'];
export type SessionLocale = SessionIdentity['locale'];
