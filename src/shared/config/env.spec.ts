import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULTED_KEYS: readonly string[] = [
    'VITE_API_URL',
    'VITE_POSTHOG_KEY',
    'VITE_POSTHOG_HOST',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_FACEBOOK_APP_ID',
    'VITE_TERMS_URL',
    'VITE_PRIVACY_URL'
];

describe('env', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it('applies the defaults when no variable is set', async () => {
        DEFAULTED_KEYS.forEach((key: string): void => {
            vi.stubEnv(key, undefined);
        });
        const { env } = await import('./env');
        expect(env.VITE_API_URL).toBe('http://localhost:3333');
        expect(env.VITE_POSTHOG_KEY).toBe('');
        expect(env.VITE_POSTHOG_HOST).toBe('https://us.i.posthog.com');
        expect(env.VITE_GOOGLE_CLIENT_ID).toBe('');
        expect(env.VITE_FACEBOOK_APP_ID).toBe('');
        expect(env.VITE_TERMS_URL).toBe('');
        expect(env.VITE_PRIVACY_URL).toBe('');
    });

    it('reads the identity provider variables', async () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'google-client-test');
        vi.stubEnv('VITE_FACEBOOK_APP_ID', 'facebook-app-test');
        vi.stubEnv('VITE_TERMS_URL', 'https://example.test/termos');
        vi.stubEnv('VITE_PRIVACY_URL', 'https://example.test/privacidade');
        const { env } = await import('./env');
        expect(env.VITE_GOOGLE_CLIENT_ID).toBe('google-client-test');
        expect(env.VITE_FACEBOOK_APP_ID).toBe('facebook-app-test');
        expect(env.VITE_TERMS_URL).toBe('https://example.test/termos');
        expect(env.VITE_PRIVACY_URL).toBe('https://example.test/privacidade');
    });

    it('fails with an invalid VITE_TERMS_URL', async () => {
        vi.stubEnv('VITE_TERMS_URL', 'not-a-url');
        await expect(import('./env')).rejects.toThrow('VITE_TERMS_URL');
    });

    it('fails with an invalid VITE_PRIVACY_URL', async () => {
        vi.stubEnv('VITE_PRIVACY_URL', 'not-a-url');
        await expect(import('./env')).rejects.toThrow('VITE_PRIVACY_URL');
    });

    it('uses the value when it is set', async () => {
        vi.stubEnv('VITE_API_URL', 'https://api.example.test');
        vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
        vi.stubEnv('VITE_POSTHOG_HOST', 'https://posthog.example.test');
        const { env } = await import('./env');
        expect(env.VITE_API_URL).toBe('https://api.example.test');
        expect(env.VITE_POSTHOG_KEY).toBe('phc_test');
        expect(env.VITE_POSTHOG_HOST).toBe('https://posthog.example.test');
    });

    it('fails with an invalid VITE_API_URL', async () => {
        vi.stubEnv('VITE_API_URL', 'not-a-url');
        await expect(import('./env')).rejects.toThrow('VITE_API_URL');
    });

    it('fails with an invalid VITE_POSTHOG_HOST', async () => {
        vi.stubEnv('VITE_POSTHOG_HOST', 'not-a-url');
        await expect(import('./env')).rejects.toThrow('VITE_POSTHOG_HOST');
    });
});
