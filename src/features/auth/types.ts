import type { components } from '@/shared/lib/api/schema';

export type SessionIdentity = components['schemas']['AuthMe'];
export type LoginSession = components['schemas']['AuthLoginSession'];
export type LoginProvider = SessionIdentity['loginProvider'];
export type SessionRole = SessionIdentity['role'];
export type SessionLocale = SessionIdentity['locale'];
