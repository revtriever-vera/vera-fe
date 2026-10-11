import type { paths } from '@/shared/lib/api/schema';
import type { SupportedLocale } from '@/shared/lib/locale';

export type AccountIdentity = paths['/auth/me/preferences']['patch']['responses']['200']['content']['application/json'];
export type PreferredLocale = SupportedLocale;
