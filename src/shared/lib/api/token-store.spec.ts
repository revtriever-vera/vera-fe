import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { tokenStore } from './token-store';

describe('tokenStore', () => {
    afterEach(() => {
        tokenStore.set(null);
    });

    it('stores and returns the current token', () => {
        expect(tokenStore.get()).toBeNull();

        tokenStore.set('token-1');

        expect(tokenStore.get()).toBe('token-1');
    });

    it('notifies subscribers on every change', () => {
        const listener: Mock = vi.fn();
        const unsubscribe: () => void = tokenStore.subscribe(listener);

        tokenStore.set('token-1');
        tokenStore.set(null);

        expect(listener).toHaveBeenNthCalledWith(1, 'token-1');
        expect(listener).toHaveBeenNthCalledWith(2, null);
        unsubscribe();
    });

    it('stops notifying after unsubscribing', () => {
        const listener: Mock = vi.fn();
        const unsubscribe: () => void = tokenStore.subscribe(listener);

        unsubscribe();
        tokenStore.set('token-1');

        expect(listener).not.toHaveBeenCalled();
    });
});
