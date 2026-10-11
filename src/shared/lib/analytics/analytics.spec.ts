import { beforeEach, describe, expect, it, vi } from 'vitest';

interface PosthogMock {
    readonly init: ReturnType<typeof vi.fn>;
    readonly capture: ReturnType<typeof vi.fn>;
    readonly reset: ReturnType<typeof vi.fn>;
}

const posthog: PosthogMock = vi.hoisted((): PosthogMock => ({ init: vi.fn(), capture: vi.fn(), reset: vi.fn() }));

vi.mock('posthog-js', () => ({ default: posthog }));

type AnalyticsModule = typeof import('./analytics');

async function loadWith(key: string): Promise<AnalyticsModule> {
    vi.resetModules();
    vi.stubEnv('VITE_POSTHOG_KEY', key);
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://us.i.posthog.com');
    return import('./analytics');
}

async function settle(): Promise<void> {
    await vi.waitFor((): void => {
        expect(posthog.init).toHaveBeenCalled();
    });
}

describe('analytics', () => {
    beforeEach(() => {
        Object.values(posthog).forEach((fn: ReturnType<typeof vi.fn>): void => {
            fn.mockReset();
        });
        vi.unstubAllEnvs();
    });

    it('sem chave é no-op: não carrega nem envia nada', async () => {
        const analytics: AnalyticsModule = await loadWith('');

        analytics.initAnalytics();
        analytics.track('auth_started', { provider: 'google' });
        analytics.track('auth_signed_out');
        analytics.resetAnalytics();

        expect(analytics.isAnalyticsEnabled()).toBe(false);
        expect(posthog.init).not.toHaveBeenCalled();
        expect(posthog.capture).not.toHaveBeenCalled();
        expect(posthog.reset).not.toHaveBeenCalled();
    });

    it('com chave, inicia o posthog sem gravar sessão nem autocapturar', async () => {
        const analytics: AnalyticsModule = await loadWith('phc_teste');

        analytics.initAnalytics();
        await settle();

        expect(posthog.init).toHaveBeenCalledWith(
            'phc_teste',
            expect.objectContaining({
                api_host: 'https://us.i.posthog.com',
                autocapture: false,
                disable_session_recording: true,
                person_profiles: 'identified_only'
            })
        );
    });

    it('enfileira eventos até o posthog carregar e depois envia direto', async () => {
        const analytics: AnalyticsModule = await loadWith('phc_teste');

        analytics.track('auth_authenticated', { provider: 'google', isNewAccount: true });
        analytics.initAnalytics();
        analytics.initAnalytics();
        await settle();
        analytics.track('portfolio_asset_removed');

        expect(posthog.init).toHaveBeenCalledOnce();
        expect(posthog.capture).toHaveBeenNthCalledWith(1, 'auth_authenticated', { provider: 'google', isNewAccount: true });
        expect(posthog.capture).toHaveBeenNthCalledWith(2, 'portfolio_asset_removed', undefined);
    });

    it('limita a fila de eventos pendentes', async () => {
        const analytics: AnalyticsModule = await loadWith('phc_teste');

        for (let index: number = 0; index < 80; index += 1) {
            analytics.track('portfolio_asset_removed');
        }
        analytics.initAnalytics();
        await settle();

        await vi.waitFor((): void => {
            expect(posthog.capture).toHaveBeenCalledTimes(50);
        });
    });

    it('reset limpa a identidade e descarta a fila', async () => {
        const analytics: AnalyticsModule = await loadWith('phc_teste');

        analytics.initAnalytics();
        await settle();
        analytics.resetAnalytics();

        expect(posthog.reset).toHaveBeenCalledOnce();
    });

    it('reset antes de carregar descarta eventos pendentes', async () => {
        const analytics: AnalyticsModule = await loadWith('phc_teste');

        analytics.track('portfolio_asset_removed');
        analytics.resetAnalytics();
        analytics.initAnalytics();
        await settle();

        expect(posthog.capture).not.toHaveBeenCalled();
    });
});
