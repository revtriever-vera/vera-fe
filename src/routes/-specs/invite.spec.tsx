import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { FacebookLoginResponse, FacebookSdk } from '@/features/auth/lib/facebook-sdk';
import type { GoogleIdentity } from '@/features/auth/lib/google-identity';
import { loginSession, problem, sessionIdentity } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const mocks: { env: Record<string, string>; loadGoogle: Mock; loadFacebook: Mock; track: Mock } = vi.hoisted(() => ({
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

const TOKEN: string = 'convite-token-com-mais-de-vinte-caracteres';

function connectFacebook(): void {
    const response: FacebookLoginResponse = { authResponse: { accessToken: 'fb-token-1' } };
    const sdk: FacebookSdk = {
        init: vi.fn(),
        login: (done: (value: FacebookLoginResponse) => void): void => {
            done(response);
        }
    };
    const identity: GoogleIdentity = { initialize: vi.fn(), renderButton: vi.fn() };
    mocks.loadGoogle.mockResolvedValue(identity);
    mocks.loadFacebook.mockResolvedValue(sdk);
}

async function openInvite(): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt(`/convite/${TOKEN}`);
    await screen.findByRole('heading', { name: 'Marcos te convidou para a conta dele na Vera' });
    return router;
}

async function clickFacebook(user: UserEvent): Promise<void> {
    const button: HTMLElement = await screen.findByRole('button', { name: 'Continuar com Facebook' });
    await waitFor((): void => {
        expect(button).toBeEnabled();
    });
    await user.click(button);
}

beforeEach((): void => {
    Object.assign(mocks.env, {
        VITE_API_URL: 'http://localhost:3333',
        VITE_GOOGLE_CLIENT_ID: 'google-client-test',
        VITE_FACEBOOK_APP_ID: 'facebook-app-test'
    });
    connectFacebook();
});

afterEach((): void => {
    tokenStore.set(null);
    mocks.loadGoogle.mockReset();
    mocks.loadFacebook.mockReset();
    mocks.track.mockReset();
});

describe('invite route', () => {
    it('shows who invited, the role and the masked e-mail', async () => {
        await openInvite();

        expect(screen.getByText('Papel: Editor. Editor mexe em carteira e gastos.')).toBeInTheDocument();
        expect(screen.getByText('Entre com a conta do Google ou do Facebook de l***@exemplo.com.')).toBeInTheDocument();
        expect(mocks.track).toHaveBeenCalledWith('invite_viewed');
    });

    it('signs in with the invite token and lands on the home with a toast', async () => {
        const user: UserEvent = userEvent.setup();
        const bodies: unknown[] = [];
        server.use(
            http.post('*/auth/facebook', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return HttpResponse.json(loginSession());
            }),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ companyName: 'Marcos Lima' })))
        );
        const router: AnyRouter = await openInvite();

        await clickFacebook(user);

        expect(await screen.findByText('Você entrou na conta de Marcos')).toBeInTheDocument();
        expect(bodies).toEqual([{ accessToken: 'fb-token-1', inviteToken: TOKEN }]);
        await waitFor((): void => {
            expect(router.state.location.pathname).not.toContain('/convite');
        });
        expect(mocks.track).toHaveBeenCalledWith('invite_accepted', { provider: 'facebook' });
    });

    it.each([
        ['invites.invalid', 410, 'Este convite expirou ou já foi usado. Peça um convite novo.'],
        ['invites.email_mismatch', 409, 'Entre com a conta de l***@exemplo.com, o e-mail que recebeu o convite.'],
        [
            'members.account_not_empty',
            409,
            'Você já tem uma conta na Vera com dados. Para entrar nesta, exporte e exclua a sua em Configurações › Dados e privacidade, ou peça um convite para outro e-mail.'
        ]
    ])('shows the message for %s on sign in', async (type: string, status: number, message: string): Promise<void> => {
        const user: UserEvent = userEvent.setup();
        server.use(http.post('*/auth/facebook', (): Response => HttpResponse.json(problem(type, status), { status })));
        await openInvite();

        await clickFacebook(user);

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(mocks.track).toHaveBeenCalledWith('invite_failed', { code: type });
    });

    it('explains an expired link and offers no sign in', async () => {
        server.use(http.get('*/invites/:token', (): Response => HttpResponse.json(problem('invites.invalid', 410), { status: 410 })));
        renderRouterAt(`/convite/${TOKEN}`);

        expect(await screen.findByText('Este convite expirou ou já foi usado. Peça um convite novo.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Continuar com Facebook' })).not.toBeInTheDocument();
    });

    it('asks to sign out when signed in to another account', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ companyName: 'Outra Pessoa' }))),
            ...signedInHandlers()
        );
        await openInvite();

        expect(screen.getByText('Você está em outra conta. Saia para aceitar o convite.')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Sair e aceitar' }));

        expect(await screen.findByRole('button', { name: 'Continuar com Facebook' })).toBeInTheDocument();
    });

    it('goes home when already in the invited account', async () => {
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ companyName: 'Marcos Lima' }))),
            ...signedInHandlers()
        );
        const router: AnyRouter = renderRouterAt(`/convite/${TOKEN}`);

        await waitFor((): void => {
            expect(router.state.location.pathname).not.toContain('/convite');
        });
    });
});
