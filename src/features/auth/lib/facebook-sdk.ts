export interface FacebookAuthResponse {
    readonly accessToken: string;
}

export interface FacebookLoginResponse {
    readonly authResponse: FacebookAuthResponse | null;
}

export interface FacebookSdk {
    readonly init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
    readonly login: (callback: (response: FacebookLoginResponse) => void, options: { scope: string }) => void;
}

interface FacebookWindow {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
}

export const FACEBOOK_GRAPH_VERSION: string = 'v21.0';

export const FACEBOOK_SCOPE: string = 'public_profile,email';

const SDK_LOCALES: Readonly<Record<string, string>> = { 'pt-BR': 'pt_BR', en: 'en_US' };

const FALLBACK_SDK_LOCALE: string = 'en_US';

let loading: Promise<FacebookSdk> | null = null;

let initialized: boolean = false;

function facebookWindow(): FacebookWindow {
    return window as unknown as FacebookWindow;
}

function initialize(sdk: FacebookSdk, appId: string): FacebookSdk {
    if (!initialized) {
        sdk.init({ appId, cookie: false, xfbml: false, version: FACEBOOK_GRAPH_VERSION });
        initialized = true;
    }
    return sdk;
}

export function facebookSdkUrl(locale: string): string {
    return `https://connect.facebook.net/${SDK_LOCALES[locale] ?? FALLBACK_SDK_LOCALE}/sdk.js`;
}

function injectScript(appId: string, locale: string): Promise<FacebookSdk> {
    return new Promise<FacebookSdk>((resolve, reject): void => {
        const target: FacebookWindow = facebookWindow();
        target.fbAsyncInit = (): void => {
            if (target.FB === undefined) {
                reject(new Error('facebook sdk unavailable'));
                return;
            }
            resolve(initialize(target.FB, appId));
        };
        const script: HTMLScriptElement = document.createElement('script');
        script.src = facebookSdkUrl(locale);
        script.async = true;
        script.onerror = (): void => {
            reject(new Error('facebook sdk script failed'));
        };
        document.head.appendChild(script);
    });
}

export function loadFacebookSdk(appId: string, locale: string): Promise<FacebookSdk> {
    const ready: FacebookSdk | undefined = facebookWindow().FB;
    if (ready !== undefined) {
        return Promise.resolve(initialize(ready, appId));
    }
    loading ??= injectScript(appId, locale).catch((error: unknown): never => {
        loading = null;
        throw error;
    });
    return loading;
}
