import type { ReactElement } from 'react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/i18n/resolve-locale';
import { loadGoogleIdentity, type GoogleCredentialResponse, type GoogleIdentity } from '../lib/google-identity';
import { useElementWidth } from '../lib/use-element-width';

export interface GoogleSignInProps {
    readonly clientId: string;
    readonly onCredential: (idToken: string) => void;
    readonly onUnavailable: () => void;
    readonly disabled?: boolean;
}

const MIN_BUTTON_WIDTH: number = 200;
const MAX_BUTTON_WIDTH: number = 400;

function clampWidth(width: number): number {
    return Math.min(MAX_BUTTON_WIDTH, Math.max(MIN_BUTTON_WIDTH, width));
}

function useGoogleIdentity(
    clientId: string,
    latest: RefObject<(idToken: string) => void>,
    onUnavailable: () => void
): GoogleIdentity | null {
    const [identity, setIdentity] = useState<GoogleIdentity | null>(null);
    useEffect((): (() => void) => {
        let active: boolean = true;
        loadGoogleIdentity()
            .then((loaded: GoogleIdentity): void => {
                if (!active) {
                    return;
                }
                loaded.initialize({
                    client_id: clientId,
                    callback: (response: GoogleCredentialResponse): void => {
                        latest.current(response.credential);
                    }
                });
                setIdentity(loaded);
            })
            .catch((): void => {
                if (active) {
                    onUnavailable();
                }
            });
        return (): void => {
            active = false;
        };
    }, [clientId, latest, onUnavailable]);
    return identity;
}

function useGoogleButton(
    identity: GoogleIdentity | null,
    container: RefObject<HTMLDivElement | null>,
    width: number,
    locale: SupportedLocale
): void {
    useEffect((): void => {
        if (identity === null || container.current === null || width === 0) {
            return;
        }
        container.current.replaceChildren();
        identity.renderButton(container.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: clampWidth(width),
            locale
        });
    }, [identity, container, width, locale]);
}

export function GoogleSignIn({ clientId, onCredential, onUnavailable, disabled = false }: GoogleSignInProps): ReactElement {
    const { t }: UseTranslationResponse<'auth', undefined> = useTranslation('auth');
    const locale: SupportedLocale = useLocale();
    const container: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    const latest: RefObject<(idToken: string) => void> = useRef<(idToken: string) => void>(onCredential);
    const width: number = useElementWidth(container);

    useEffect((): void => {
        latest.current = onCredential;
    }, [onCredential]);

    const identity: GoogleIdentity | null = useGoogleIdentity(clientId, latest, onUnavailable);
    useGoogleButton(identity, container, width, locale);

    return (
        <div
            ref={container}
            role="group"
            aria-label={t('continueWithGoogle')}
            className={cn('flex min-h-10 w-full justify-center', disabled && 'pointer-events-none opacity-60')}
        />
    );
}
