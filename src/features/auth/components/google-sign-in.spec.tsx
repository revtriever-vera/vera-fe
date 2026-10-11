import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { i18n } from '@/shared/lib/i18n';
import type { GoogleCredentialResponse, GoogleIdentity } from '../lib/google-identity';
import { GoogleSignIn } from './google-sign-in';

const loader: { load: Mock } = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock('../lib/google-identity', () => ({ loadGoogleIdentity: loader.load }));

interface FakeIdentity extends GoogleIdentity {
    readonly initialize: Mock<GoogleIdentity['initialize']>;
    readonly renderButton: Mock<GoogleIdentity['renderButton']>;
}

function fakeIdentity(): FakeIdentity {
    return { initialize: vi.fn(), renderButton: vi.fn() };
}

function setBoxWidth(width: number): void {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: (): number => width });
}

function renderButton(onCredential: (idToken: string) => void = vi.fn(), onUnavailable: () => void = vi.fn()): void {
    render(<GoogleSignIn clientId="client-test.apps.example" onCredential={onCredential} onUnavailable={onUnavailable} />);
}

describe('GoogleSignIn', () => {
    beforeEach((): void => {
        setBoxWidth(380);
    });

    afterEach((): void => {
        Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
        loader.load.mockReset();
    });

    it('initialises with the client id and renders the button with the locale and the measured width', async () => {
        const identity: FakeIdentity = fakeIdentity();
        loader.load.mockResolvedValue(identity);

        renderButton();

        await waitFor((): void => {
            expect(identity.renderButton).toHaveBeenCalledTimes(1);
        });
        expect(identity.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: 'client-test.apps.example' }));
        expect(identity.renderButton).toHaveBeenCalledWith(screen.getByRole('group', { name: 'Continuar com Google' }), {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: 380,
            locale: 'pt-BR'
        });
    });

    it('keeps the width between 200 and 400 pixels', async () => {
        const identity: FakeIdentity = fakeIdentity();
        loader.load.mockResolvedValue(identity);
        setBoxWidth(520);

        renderButton();

        await waitFor((): void => {
            expect(identity.renderButton).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ width: 400 }));
        });
    });

    it('raises the width to 200 pixels in a very narrow box', async () => {
        const identity: FakeIdentity = fakeIdentity();
        loader.load.mockResolvedValue(identity);
        setBoxWidth(150);

        renderButton();

        await waitFor((): void => {
            expect(identity.renderButton).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ width: 200 }));
        });
    });

    it('renders the button in the active language', async () => {
        await i18n.changeLanguage('en');
        const identity: FakeIdentity = fakeIdentity();
        loader.load.mockResolvedValue(identity);

        renderButton();

        await waitFor((): void => {
            expect(identity.renderButton).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ locale: 'en' }));
        });
    });

    it('hands the credential of the callback to the latest handler', async () => {
        const identity: FakeIdentity = fakeIdentity();
        loader.load.mockResolvedValue(identity);
        const onCredential: (idToken: string) => void = vi.fn();

        renderButton(onCredential);
        await waitFor((): void => {
            expect(identity.initialize).toHaveBeenCalled();
        });
        const config: { callback: (response: GoogleCredentialResponse) => void } = identity.initialize.mock.calls[0]?.[0] as {
            callback: (response: GoogleCredentialResponse) => void;
        };
        config.callback({ credential: 'id-token-1' });

        expect(onCredential).toHaveBeenCalledWith('id-token-1');
    });

    it('reports the provider as unavailable when the script cannot be loaded', async () => {
        loader.load.mockRejectedValue(new Error('blocked'));
        const onUnavailable: () => void = vi.fn();

        renderButton(vi.fn(), onUnavailable);

        await waitFor((): void => {
            expect(onUnavailable).toHaveBeenCalledTimes(1);
        });
    });
});
