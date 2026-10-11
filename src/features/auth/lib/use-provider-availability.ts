import { useCallback, useState } from 'react';
import { env } from '@/shared/config/env';

export interface ProviderAvailability {
    readonly google: boolean;
    readonly facebook: boolean;
    readonly markGoogleBlocked: () => void;
    readonly markFacebookBlocked: () => void;
}

export function useProviderAvailability(): ProviderAvailability {
    const [googleBlocked, setGoogleBlocked] = useState<boolean>(false);
    const [facebookBlocked, setFacebookBlocked] = useState<boolean>(false);
    const markGoogleBlocked: () => void = useCallback((): void => {
        setGoogleBlocked(true);
    }, []);
    const markFacebookBlocked: () => void = useCallback((): void => {
        setFacebookBlocked(true);
    }, []);
    return {
        google: env.VITE_GOOGLE_CLIENT_ID !== '' && !googleBlocked,
        facebook: env.VITE_FACEBOOK_APP_ID !== '' && !facebookBlocked,
        markGoogleBlocked,
        markFacebookBlocked
    };
}
