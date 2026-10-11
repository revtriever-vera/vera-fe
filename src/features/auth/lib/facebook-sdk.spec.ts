import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FacebookSdk } from './facebook-sdk';

type FacebookLoader = typeof import('./facebook-sdk');

interface FacebookWindow {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
}

function fakeSdk(): FacebookSdk {
    return { init: vi.fn(), login: vi.fn() };
}

function captureScripts(): HTMLScriptElement[] {
    const scripts: HTMLScriptElement[] = [];
    vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
        scripts.push(node as unknown as HTMLScriptElement);
        return node;
    });
    return scripts;
}

async function freshLoader(): Promise<FacebookLoader> {
    vi.resetModules();
    return import('./facebook-sdk');
}

function clearWindow(): void {
    delete (window as unknown as FacebookWindow).FB;
    delete (window as unknown as FacebookWindow).fbAsyncInit;
}

afterEach((): void => {
    vi.restoreAllMocks();
    clearWindow();
});

describe('facebookSdkUrl', () => {
    it('maps the app locale to the SDK locale and falls back to en_US', async () => {
        const { facebookSdkUrl }: FacebookLoader = await freshLoader();

        expect(facebookSdkUrl('pt-BR')).toBe('https://connect.facebook.net/pt_BR/sdk.js');
        expect(facebookSdkUrl('en')).toBe('https://connect.facebook.net/en_US/sdk.js');
        expect(facebookSdkUrl('fr')).toBe('https://connect.facebook.net/en_US/sdk.js');
    });
});

describe('loadFacebookSdk', () => {
    it('initialises an SDK that is already on the page only once', async () => {
        const sdk: FacebookSdk = fakeSdk();
        (window as unknown as FacebookWindow).FB = sdk;
        const { loadFacebookSdk, FACEBOOK_GRAPH_VERSION }: FacebookLoader = await freshLoader();

        await loadFacebookSdk('app-1', 'pt-BR');
        await loadFacebookSdk('app-1', 'pt-BR');

        expect(sdk.init).toHaveBeenCalledTimes(1);
        expect(sdk.init).toHaveBeenCalledWith({ appId: 'app-1', cookie: false, xfbml: false, version: FACEBOOK_GRAPH_VERSION });
    });

    it('injects the script once and resolves when the SDK calls fbAsyncInit', async () => {
        const scripts: HTMLScriptElement[] = captureScripts();
        const { loadFacebookSdk }: FacebookLoader = await freshLoader();

        const first: Promise<FacebookSdk> = loadFacebookSdk('app-1', 'en');
        const second: Promise<FacebookSdk> = loadFacebookSdk('app-1', 'en');
        const sdk: FacebookSdk = fakeSdk();
        (window as unknown as FacebookWindow).FB = sdk;
        (window as unknown as FacebookWindow).fbAsyncInit?.();

        await expect(first).resolves.toBe(sdk);
        await expect(second).resolves.toBe(sdk);
        expect(scripts).toHaveLength(1);
        expect(scripts[0]?.src).toBe('https://connect.facebook.net/en_US/sdk.js');
        expect(sdk.init).toHaveBeenCalledTimes(1);
    });

    it('rejects when the SDK announces itself without exposing FB', async () => {
        captureScripts();
        const { loadFacebookSdk }: FacebookLoader = await freshLoader();

        const pending: Promise<FacebookSdk> = loadFacebookSdk('app-1', 'en');
        (window as unknown as FacebookWindow).fbAsyncInit?.();

        await expect(pending).rejects.toThrow('facebook sdk unavailable');
    });

    it('rejects when the script fails and tries again on the next call', async () => {
        const scripts: HTMLScriptElement[] = captureScripts();
        const { loadFacebookSdk }: FacebookLoader = await freshLoader();

        const failed: Promise<FacebookSdk> = loadFacebookSdk('app-1', 'en');
        scripts[0]?.onerror?.(new Event('error'));
        await expect(failed).rejects.toThrow('facebook sdk script failed');

        void loadFacebookSdk('app-1', 'en');
        expect(scripts).toHaveLength(2);
    });
});
