export interface GoogleCredentialResponse {
    readonly credential: string;
}

export interface GoogleButtonOptions {
    readonly theme: 'outline' | 'filled_blue' | 'filled_black';
    readonly size: 'large' | 'medium' | 'small';
    readonly text: 'signin_with' | 'continue_with';
    readonly width: number;
    readonly locale: string;
}

export interface GoogleIdentity {
    readonly initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
    readonly renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
}

interface GoogleWindow {
    google?: { accounts?: { id?: GoogleIdentity } };
}

const SCRIPT_URL: string = 'https://accounts.google.com/gsi/client';

let loading: Promise<GoogleIdentity> | null = null;

function identityOf(): GoogleIdentity | null {
    return (window as unknown as GoogleWindow).google?.accounts?.id ?? null;
}

function injectScript(): Promise<GoogleIdentity> {
    return new Promise<GoogleIdentity>((resolve, reject): void => {
        const script: HTMLScriptElement = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.onload = (): void => {
            const identity: GoogleIdentity | null = identityOf();
            if (identity === null) {
                reject(new Error('google identity unavailable'));
                return;
            }
            resolve(identity);
        };
        script.onerror = (): void => {
            reject(new Error('google identity script failed'));
        };
        document.head.appendChild(script);
    });
}

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
    const ready: GoogleIdentity | null = identityOf();
    if (ready !== null) {
        return Promise.resolve(ready);
    }
    loading ??= injectScript().catch((error: unknown): never => {
        loading = null;
        throw error;
    });
    return loading;
}
