import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GoogleIdentity } from './google-identity';

type GoogleLoader = typeof import('./google-identity');

interface GoogleWindow {
    google?: { accounts?: { id?: GoogleIdentity } };
}

const FAKE_IDENTITY: GoogleIdentity = { initialize: vi.fn(), renderButton: vi.fn() };

function captureScripts(): HTMLScriptElement[] {
    const scripts: HTMLScriptElement[] = [];
    vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
        scripts.push(node as unknown as HTMLScriptElement);
        return node;
    });
    return scripts;
}

async function freshLoader(): Promise<GoogleLoader> {
    vi.resetModules();
    return import('./google-identity');
}

describe('loadGoogleIdentity', () => {
    beforeEach((): void => {
        delete (window as unknown as GoogleWindow).google;
    });

    afterEach((): void => {
        vi.restoreAllMocks();
        delete (window as unknown as GoogleWindow).google;
    });

    it('reuses the identity that is already on the page without injecting a script', async () => {
        const scripts: HTMLScriptElement[] = captureScripts();
        (window as unknown as GoogleWindow).google = { accounts: { id: FAKE_IDENTITY } };
        const { loadGoogleIdentity }: GoogleLoader = await freshLoader();

        await expect(loadGoogleIdentity()).resolves.toBe(FAKE_IDENTITY);
        expect(scripts).toHaveLength(0);
    });

    it('injects the script once and shares the promise between callers', async () => {
        const scripts: HTMLScriptElement[] = captureScripts();
        const { loadGoogleIdentity }: GoogleLoader = await freshLoader();

        const first: Promise<GoogleIdentity> = loadGoogleIdentity();
        const second: Promise<GoogleIdentity> = loadGoogleIdentity();
        (window as unknown as GoogleWindow).google = { accounts: { id: FAKE_IDENTITY } };
        scripts[0]?.onload?.(new Event('load'));

        await expect(first).resolves.toBe(FAKE_IDENTITY);
        await expect(second).resolves.toBe(FAKE_IDENTITY);
        expect(scripts).toHaveLength(1);
        expect(scripts[0]?.src).toBe('https://accounts.google.com/gsi/client');
    });

    it('rejects when the script loads without exposing the identity', async () => {
        const scripts: HTMLScriptElement[] = captureScripts();
        const { loadGoogleIdentity }: GoogleLoader = await freshLoader();

        const pending: Promise<GoogleIdentity> = loadGoogleIdentity();
        scripts[0]?.onload?.(new Event('load'));

        await expect(pending).rejects.toThrow('google identity unavailable');
    });

    it('rejects when the script fails and tries again on the next call', async () => {
        const scripts: HTMLScriptElement[] = captureScripts();
        const { loadGoogleIdentity }: GoogleLoader = await freshLoader();

        const failed: Promise<GoogleIdentity> = loadGoogleIdentity();
        scripts[0]?.onerror?.(new Event('error'));
        await expect(failed).rejects.toThrow('google identity script failed');

        const retry: Promise<GoogleIdentity> = loadGoogleIdentity();
        (window as unknown as GoogleWindow).google = { accounts: { id: FAKE_IDENTITY } };
        scripts[1]?.onload?.(new Event('load'));

        await expect(retry).resolves.toBe(FAKE_IDENTITY);
        expect(scripts).toHaveLength(2);
    });
});
