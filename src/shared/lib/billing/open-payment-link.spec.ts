import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { openPaymentLink } from './open-payment-link';

interface FakeTab {
    opener: unknown;
    location: { href: string };
    close: ReturnType<typeof vi.fn>;
}

function fakeTab(): FakeTab {
    return { opener: 'app', location: { href: '' }, close: vi.fn() };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('openPaymentLink', () => {
    it('opens the tab at once and points it at the url later', async () => {
        const tab: FakeTab = fakeTab();
        const open: MockInstance = vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);

        await openPaymentLink(async (): Promise<string> => Promise.resolve('https://pay.example/1'));

        expect(open).toHaveBeenCalledWith('about:blank', '_blank');
        expect(tab.opener).toBeNull();
        expect(tab.location.href).toBe('https://pay.example/1');
    });

    it('closes the tab and rethrows when the url cannot be loaded', async () => {
        const tab: FakeTab = fakeTab();
        vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);

        await expect(openPaymentLink(async (): Promise<string> => Promise.reject(new Error('boom')))).rejects.toThrow('boom');

        expect(tab.close).toHaveBeenCalled();
    });

    it('goes to the url in the same tab when the popup is blocked', async () => {
        vi.spyOn(window, 'open').mockReturnValue(null);
        const assign: ReturnType<typeof vi.fn> = vi.fn();
        vi.spyOn(window, 'location', 'get').mockReturnValue({ assign } as unknown as Location);

        await openPaymentLink(async (): Promise<string> => Promise.resolve('https://pay.example/2'));

        expect(assign).toHaveBeenCalledWith('https://pay.example/2');
    });
});
