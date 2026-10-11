import { useEffect, useRef, type RefObject } from 'react';
import { useSession } from '@/app/providers/session-provider';
import { i18n } from '@/shared/lib/i18n';
import { resolveLocale, type SupportedLocale } from '@/shared/lib/i18n/resolve-locale';

export function LocaleSync(): null {
    const { user } = useSession();
    const userLocale: string | null = user?.locale ?? null;
    const hadSession: RefObject<boolean> = useRef<boolean>(false);

    useEffect((): void => {
        if (userLocale === null && !hadSession.current) {
            return;
        }
        hadSession.current = userLocale !== null;
        const next: SupportedLocale = resolveLocale({ userLocale, navigatorLanguage: navigator.language });
        if (next !== i18n.language) {
            void i18n.changeLanguage(next);
        }
    }, [userLocale]);

    return null;
}
