import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { resetAnalytics, track } from '@/shared/lib/analytics';
import { i18n } from '@/shared/lib/i18n';
import { server } from './msw/server';

vi.mock('@/shared/lib/analytics', () => ({
    track: vi.fn(),
    initAnalytics: vi.fn(),
    resetAnalytics: vi.fn(),
    isAnalyticsEnabled: vi.fn((): boolean => false)
}));

configure({ asyncUtilTimeout: 5000 });

function polyfillPointerCapture(): void {
    Element.prototype.hasPointerCapture = (): boolean => false;
    Element.prototype.setPointerCapture = (): void => undefined;
    Element.prototype.releasePointerCapture = (): void => undefined;
}

function polyfillResizeObserver(): void {
    globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
    };
}

beforeAll(() => {
    polyfillResizeObserver();
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    polyfillPointerCapture();
    server.listen({ onUnhandledRequest: 'error' });
});

beforeEach(async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt-BR');
    await i18n.changeLanguage('pt-BR');
});

afterEach(() => {
    vi.mocked(track).mockClear();
    vi.mocked(resetAnalytics).mockClear();
    cleanup();
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
