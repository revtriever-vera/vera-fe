import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { tokenStore } from '@/shared/lib/api/token-store';
import { i18n } from '@/shared/lib/i18n';
import type { GoogleCredentialResponse, GoogleIdentity } from '@/features/auth/lib/google-identity';
import type { FacebookLoginResponse, FacebookSdk } from '@/features/auth/lib/facebook-sdk';
import { loginSession, problem, sessionIdentity } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const mocks: {
    env: Record<string, string>;
    loadGoogle: Mock;
    loadFacebook: Mock;
    track: Mock;
} = vi.hoisted(() => ({
    env: { VITE_API_URL: 'http://localhost:3333' },
    loadGoogle: vi.fn(),
    loadFacebook: vi.fn(),
    track: vi.fn()
}));

vi.mock('@/shared/config/env', () => ({ env: mocks.env }));
vi.mock('@/shared/lib/analytics', () => ({ track: mocks.track, resetAnalytics: vi.fn(), initAnalytics: vi.fn() }));
vi.mock('@/features/auth/lib/google-identity', () => ({ loadGoogleIdentity: mocks.loadGoogle }));
vi.mock('@/features/auth/lib/facebook-sdk', async (importOriginal: () => Promise<typeof import('@/features/auth/lib/facebook-sdk')>) => ({
    ...(await importOriginal()),
    loadFacebookSdk: mocks.loadFacebook
}));

const FULL_ENV: Record<string, string> = {
    VITE_API_URL: 'http://localhost:3333',
    VITE_GOOGLE_CLIENT_ID: 'google-client-test',
    VITE_FACEBOOK_APP_ID: 'facebook-app-test',
    VITE_TERMS_URL: 'https://example.test/termos',
    VITE_PRIVACY_URL: 'https://example.test/privacidade'
};

interface Providers {
    readonly emitGoogleCredential: (idToken: string) => void;
    readonly facebookResponse: { current: FacebookLoginResponse };
}

function connectProviders(): Providers {
    let callback: (response: GoogleCredentialResponse) => void = (): void => undefined;
    const identity: GoogleIdentity = {
        initialize: (config): void => {
            callback = config.callback;
        },
        renderButton: vi.fn()
    };
    const facebookResponse: { current: FacebookLoginResponse } = { current: { authResponse: { accessToken: 'fb-token-1' } } };
    const sdk: FacebookSdk = {
        init: vi.fn(),
        login: (done: (response: FacebookLoginResponse) => void): void => {
            done(facebookResponse.current);
        }
    };
    mocks.loadGoogle.mockResolvedValue(identity);
    mocks.loadFacebook.mockResolvedValue(sdk);
    return {
        emitGoogleCredential: (idToken: string): void => {
            callback({ credential: idToken });
        },
        facebookResponse
    };
}

async function openLogin(title: string = 'Entrar'): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt('/login');
    await screen.findByRole('heading', { name: title });
    return router;
}

async function clickFacebook(user: UserEvent): Promise<void> {
    const button: HTMLElement = await screen.findByRole('button', { name: /Continu(ar|e) (com|with) Facebook/ });
    await waitFor((): void => {
        expect(button).toBeEnabled();
    });
    await user.click(button);
}

function failLogin(path: string, type: string, status: number): void {
    server.use(http.post(path, (): Response => HttpResponse.json(problem(type, status), { status })));
}

beforeEach((): void => {
    Object.assign(mocks.env, FULL_ENV);
});

afterEach((): void => {
    tokenStore.set(null);
    mocks.loadGoogle.mockReset();
    mocks.loadFacebook.mockReset();
    mocks.track.mockReset();
});

describe('login route providers', () => {
    it('shows both buttons when both providers are configured', async () => {
        connectProviders();

        await openLogin();

        expect(screen.getByRole('group', { name: 'Continuar com Google' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeInTheDocument();
        expect(screen.getByText(/Use sua conta do Google ou do Facebook/)).toBeInTheDocument();
    });

    it('hides Google when the client id is empty', async () => {
        connectProviders();
        mocks.env['VITE_GOOGLE_CLIENT_ID'] = '';

        await openLogin();

        expect(screen.queryByRole('group', { name: 'Continuar com Google' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeInTheDocument();
    });

    it('hides Facebook when the app id is empty', async () => {
        connectProviders();
        mocks.env['VITE_FACEBOOK_APP_ID'] = '';

        await openLogin();

        expect(screen.queryByRole('button', { name: 'Continuar com Facebook' })).not.toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Continuar com Google' })).toBeInTheDocument();
    });

    it('warns that sign-in is unavailable when no provider is configured', async () => {
        mocks.env['VITE_GOOGLE_CLIENT_ID'] = '';
        mocks.env['VITE_FACEBOOK_APP_ID'] = '';

        await openLogin();

        expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar as opções de entrada.');
        expect(screen.getByText(/Ao continuar, você concorda/)).toBeInTheDocument();
    });

    it('hides only Google when its script fails to load', async () => {
        connectProviders();
        mocks.loadGoogle.mockRejectedValue(new Error('blocked'));

        await openLogin();

        await waitFor((): void => {
            expect(screen.queryByRole('group', { name: 'Continuar com Google' })).not.toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('hides only Facebook when its SDK fails to load', async () => {
        connectProviders();
        mocks.loadFacebook.mockRejectedValue(new Error('blocked'));

        await openLogin();

        await waitFor((): void => {
            expect(screen.queryByRole('button', { name: 'Continuar com Facebook' })).not.toBeInTheDocument();
        });
        expect(screen.getByRole('group', { name: 'Continuar com Google' })).toBeInTheDocument();
    });

    it('shows the unavailable warning when both scripts fail to load', async () => {
        mocks.loadGoogle.mockRejectedValue(new Error('blocked'));
        mocks.loadFacebook.mockRejectedValue(new Error('blocked'));

        await openLogin();

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as opções de entrada.');
    });
});

describe('login route sign-in flow', () => {
    it('signs in with Google, stores the token, loads the profile and goes home', async () => {
        const providers: Providers = connectProviders();
        const authorizations: (string | null)[] = [];
        server.use(
            http.post('*/auth/google', async ({ request }): Promise<Response> => {
                expect(await request.json()).toEqual({ idToken: 'id-token-1' });
                return HttpResponse.json(loginSession({ accessToken: 'access-google' }));
            }),
            http.get('*/auth/me', ({ request }): Response => {
                authorizations.push(request.headers.get('authorization'));
                return HttpResponse.json(sessionIdentity());
            })
        );
        const router: AnyRouter = await openLogin();
        await waitFor((): void => {
            expect(mocks.loadGoogle).toHaveBeenCalled();
        });

        providers.emitGoogleCredential('id-token-1');

        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/');
        });
        expect(tokenStore.get()).toBe('access-google');
        expect(authorizations).toEqual(['Bearer access-google']);
        expect(mocks.track).toHaveBeenCalledWith('auth_screen_viewed');
        expect(mocks.track).toHaveBeenCalledWith('auth_started', { provider: 'google' });
        expect(mocks.track).toHaveBeenCalledWith('auth_authenticated', { provider: 'google', isNewAccount: true });
    });

    it('signs in with Facebook, stores the token, loads the profile and goes home', async () => {
        connectProviders();
        server.use(
            http.post('*/auth/facebook', async ({ request }): Promise<Response> => {
                expect(await request.json()).toEqual({ accessToken: 'fb-token-1' });
                return HttpResponse.json(loginSession({ accessToken: 'access-facebook', isNewAccount: false }));
            }),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ loginProvider: 'facebook' })))
        );
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openLogin();

        await clickFacebook(user);

        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/');
        });
        expect(tokenStore.get()).toBe('access-facebook');
        expect(mocks.track).toHaveBeenCalledWith('auth_authenticated', { provider: 'facebook', isNewAccount: false });
    });

    it('shows no error when the person closes the Facebook popup', async () => {
        const providers: Providers = connectProviders();
        providers.facebookResponse.current = { authResponse: null };
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = await openLogin();

        await clickFacebook(user);

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/login');
        expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeEnabled();
    });

    it('drops the token and shows an error when the profile cannot be loaded after the login', async () => {
        const providers: Providers = connectProviders();
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(problem('identity.unauthorized', 500), { status: 500 })));
        await openLogin();
        await waitFor((): void => {
            expect(mocks.loadGoogle).toHaveBeenCalled();
        });

        providers.emitGoogleCredential('id-token-1');

        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível entrar. Tente novamente em instantes.');
        expect(tokenStore.get()).toBeNull();
    });
});

interface ErrorCase {
    readonly name: string;
    readonly path: string;
    readonly type: string;
    readonly status: number;
    readonly ptBR: string;
    readonly en: string;
}

const ERROR_CASES: readonly ErrorCase[] = [
    {
        name: 'a conta já existe por outro provedor',
        path: '*/auth/facebook',
        type: 'identity.email_in_use',
        status: 409,
        ptBR: 'Já existe uma conta com este e-mail, criada por outro provedor. Entre com o provedor que você usou antes.',
        en: 'An account with this email already exists, created with another provider. Sign in with the provider you used before.'
    },
    {
        name: 'o Facebook não compartilhou o e-mail',
        path: '*/auth/facebook',
        type: 'identity.email_not_provided',
        status: 422,
        ptBR: 'O Facebook não compartilhou o seu e-mail. Entre com o Google ou permita o acesso ao e-mail ao entrar com o Facebook.',
        en: 'Facebook did not share your email. Sign in with Google, or allow email access when signing in with Facebook.'
    },
    {
        name: 'muitas tentativas',
        path: '*/auth/facebook',
        type: 'core.too_many_attempts',
        status: 429,
        ptBR: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
        en: 'Too many attempts. Wait a few minutes and try again.'
    },
    {
        name: 'provedor indisponível',
        path: '*/auth/facebook',
        type: 'identity.provider_unavailable',
        status: 503,
        ptBR: 'O provedor não respondeu. Tente de novo em instantes.',
        en: 'The provider did not respond. Please try again in a moment.'
    },
    {
        name: 'código desconhecido',
        path: '*/auth/facebook',
        type: 'identity.algo_novo',
        status: 400,
        ptBR: 'Não foi possível entrar. Tente novamente em instantes.',
        en: 'We could not sign you in. Please try again in a moment.'
    }
];

describe('login route errors', () => {
    it.each(ERROR_CASES)('mostra a mensagem em pt-BR quando $name', async ({ path, type, status, ptBR }: ErrorCase): Promise<void> => {
        connectProviders();
        failLogin(path, type, status);
        const user: UserEvent = userEvent.setup();
        await openLogin();

        await clickFacebook(user);

        expect(await screen.findByRole('alert')).toHaveTextContent(ptBR);
        expect(screen.queryByText(/detalhe técnico/)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continuar com Facebook' })).toBeEnabled();
        expect(tokenStore.get()).toBeNull();
    });

    it.each(ERROR_CASES)('shows the message in en when $name', async ({ path, type, status, en }: ErrorCase): Promise<void> => {
        await i18n.changeLanguage('en');
        connectProviders();
        failLogin(path, type, status);
        const user: UserEvent = userEvent.setup();
        await openLogin('Sign in');

        await clickFacebook(user);

        expect(await screen.findByRole('alert')).toHaveTextContent(en);
    });

    it('shows the invalid token error of Google and lets the person try again', async () => {
        const providers: Providers = connectProviders();
        failLogin('*/auth/google', 'identity.invalid_google_token', 401);
        await openLogin();
        await waitFor((): void => {
            expect(mocks.loadGoogle).toHaveBeenCalled();
        });

        providers.emitGoogleCredential('id-token-1');

        expect(await screen.findByRole('alert')).toHaveTextContent('Não conseguimos confirmar sua conta do Google. Tente entrar de novo.');
        expect(tokenStore.get()).toBeNull();
        expect(mocks.track).toHaveBeenCalledWith('auth_failed', { provider: 'google', code: 'identity.invalid_google_token' });
    });

    it('clears the previous error when a new attempt starts', async () => {
        connectProviders();
        failLogin('*/auth/facebook', 'core.too_many_attempts', 429);
        const user: UserEvent = userEvent.setup();
        await openLogin();
        await clickFacebook(user);
        await screen.findByRole('alert');

        server.use(http.post('*/auth/facebook', (): Response => HttpResponse.json(loginSession())));
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity())));
        await user.click(screen.getByRole('button', { name: 'Continuar com Facebook' }));

        await waitFor((): void => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});

describe('login route legal note', () => {
    it('links the terms and the privacy policy when the urls are set', async () => {
        connectProviders();

        await openLogin();

        expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', 'https://example.test/termos');
        expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', 'https://example.test/privacidade');
    });

    it('keeps the sentence without links when the urls are empty', async () => {
        connectProviders();
        mocks.env['VITE_TERMS_URL'] = '';
        mocks.env['VITE_PRIVACY_URL'] = '';

        await openLogin();

        expect(screen.queryByRole('link', { name: 'Termos de Uso' })).not.toBeInTheDocument();
        expect(screen.getByText(/Ao continuar, você concorda com os/)).toHaveTextContent(
            'Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.'
        );
    });

    it('shows the powered by line', async () => {
        connectProviders();

        await openLogin();

        expect(screen.getByText(/powered by/)).toHaveTextContent('powered by Revtriever');
    });
});

describe('login route with a session', () => {
    it('redirects to home when the session is restored', async () => {
        connectProviders();
        const router: AnyRouter = renderRouterAt('/login', { signedIn: true });

        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/');
        });
    });

    it('shows only the background while the session is being restored', async () => {
        connectProviders();
        let release: () => void = (): void => undefined;
        const gate: Promise<void> = new Promise<void>((resolve): void => {
            release = resolve;
        });
        server.use(
            http.post('*/auth/refresh', async (): Promise<Response> => {
                await gate;
                return HttpResponse.json(problem('identity.invalid_refresh', 401), { status: 401 });
            })
        );

        renderRouterAt('/login');
        await screen.findByRole('main');

        expect(screen.queryByRole('heading', { name: 'Entrar' })).not.toBeInTheDocument();
        release();
        expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    });
});

describe('login route account deleted notice', () => {
    it('shows the notice once and removes the parameter from the address', async () => {
        connectProviders();
        const router: AnyRouter = renderRouterAt('/login?deleted=1&redirect=%2Fportfolio');

        expect(await screen.findByText('Sua conta foi excluída.')).toBeInTheDocument();
        await waitFor((): void => {
            expect(router.state.location.search).toEqual({ redirect: '/portfolio' });
        });
        expect(screen.getByText('Sua conta foi excluída.')).toBeInTheDocument();
    });

    it('does not show the notice without the parameter', async () => {
        connectProviders();

        await openLogin();

        expect(screen.queryByText('Sua conta foi excluída.')).not.toBeInTheDocument();
    });
});
