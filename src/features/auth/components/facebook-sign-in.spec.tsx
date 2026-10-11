import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { FacebookLoginResponse, FacebookSdk } from '../lib/facebook-sdk';
import { FacebookSignIn } from './facebook-sign-in';

const loader: { load: Mock } = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock('../lib/facebook-sdk', async (importOriginal: () => Promise<typeof import('../lib/facebook-sdk')>) => ({
    ...(await importOriginal()),
    loadFacebookSdk: loader.load
}));

interface FakeSdk extends FacebookSdk {
    readonly login: Mock<FacebookSdk['login']>;
}

function fakeSdk(response: FacebookLoginResponse): FakeSdk {
    return {
        init: vi.fn(),
        login: vi.fn((callback: (result: FacebookLoginResponse) => void): void => {
            callback(response);
        })
    };
}

function renderButton(onAccessToken: (accessToken: string) => void = vi.fn(), onUnavailable: () => void = vi.fn()): void {
    render(<FacebookSignIn appId="app-test" onAccessToken={onAccessToken} onUnavailable={onUnavailable} />);
}

async function readyButton(): Promise<HTMLElement> {
    const button: HTMLElement = await screen.findByRole('button', { name: 'Continuar com Facebook' });
    await waitFor((): void => {
        expect(button).toBeEnabled();
    });
    return button;
}

afterEach((): void => {
    loader.load.mockReset();
});

describe('FacebookSignIn', () => {
    it('stays disabled until the SDK is ready', async () => {
        let release: (sdk: FacebookSdk) => void = (): void => undefined;
        loader.load.mockReturnValue(
            new Promise<FacebookSdk>((resolve): void => {
                release = resolve;
            })
        );

        renderButton();

        expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeDisabled();
        release(fakeSdk({ authResponse: null }));
        await waitFor((): void => {
            expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeEnabled();
        });
    });

    it('asks for the public profile and the email when clicked', async () => {
        const sdk: FakeSdk = fakeSdk({ authResponse: { accessToken: 'fb-token-1' } });
        loader.load.mockResolvedValue(sdk);
        const onAccessToken: (accessToken: string) => void = vi.fn();
        const user: UserEvent = userEvent.setup();

        renderButton(onAccessToken);
        await user.click(await readyButton());

        expect(sdk.login).toHaveBeenCalledWith(expect.any(Function), { scope: 'public_profile,email' });
        expect(onAccessToken).toHaveBeenCalledWith('fb-token-1');
    });

    it('does nothing when the person closes the popup or denies access', async () => {
        const sdk: FakeSdk = fakeSdk({ authResponse: null });
        loader.load.mockResolvedValue(sdk);
        const onAccessToken: (accessToken: string) => void = vi.fn();
        const user: UserEvent = userEvent.setup();

        renderButton(onAccessToken);
        await user.click(await readyButton());

        expect(sdk.login).toHaveBeenCalledTimes(1);
        expect(onAccessToken).not.toHaveBeenCalled();
    });

    it('reports the provider as unavailable when the SDK cannot be loaded', async () => {
        loader.load.mockRejectedValue(new Error('blocked'));
        const onUnavailable: () => void = vi.fn();

        renderButton(vi.fn(), onUnavailable);

        await waitFor((): void => {
            expect(onUnavailable).toHaveBeenCalledTimes(1);
        });
    });
});
