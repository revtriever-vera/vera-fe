import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { GoogleCredentialResponse, GoogleIdentity } from '@/features/auth/lib/google-identity';
import { loginSession, problem, sessionIdentity } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const mocks: { env: Record<string, string>; loadGoogle: Mock; track: Mock } = vi.hoisted(() => ({
    env: { VITE_API_URL: 'http://localhost:3333' },
    loadGoogle: vi.fn(),
    track: vi.fn()
}));

vi.mock('@/shared/config/env', () => ({ env: mocks.env }));
vi.mock('@/shared/lib/analytics', () => ({ track: mocks.track, resetAnalytics: vi.fn(), initAnalytics: vi.fn() }));
vi.mock('@/features/auth/lib/google-identity', () => ({ loadGoogleIdentity: mocks.loadGoogle }));

const TOKEN: string = 'oferta-token-com-mais-de-vinte-caracteres';

const PUBLIC_OFFER = {
    trial: { kind: 'no_card', days: 14 },
    rules: [
        { percent: 50, fromCycle: 1, toCycle: 3 },
        { percent: 25, fromCycle: 4, toCycle: 6 }
    ],
    expiresAt: '2026-12-31T12:00:00.000Z'
};

const REDEEMED = {
    trial: { kind: 'none', days: null },
    rules: [],
    redeemedAt: '2026-11-23T12:00:00.000Z',
    expiresAt: '2026-12-23T12:00:00.000Z'
};

let emitGoogleCredential: (idToken: string) => void = (): void => undefined;

function connectGoogle(): void {
    const identity: GoogleIdentity = {
        initialize: (config): void => {
            emitGoogleCredential = (idToken: string): void => {
                config.callback({ credential: idToken } satisfies GoogleCredentialResponse);
            };
        },
        renderButton: vi.fn()
    };
    mocks.loadGoogle.mockResolvedValue(identity);
}

async function openOffer(): Promise<AnyRouter> {
    const router: AnyRouter = renderRouterAt(`/entrar?oferta=${TOKEN}`);
    await screen.findByRole('heading', { name: 'Você recebeu uma oferta do Premium' });
    return router;
}

async function signInWithGoogle(): Promise<void> {
    await screen.findByRole('group', { name: 'Continuar com Google' });
    await waitFor((): void => {
        expect(mocks.loadGoogle).toHaveBeenCalled();
    });
    emitGoogleCredential('google-token-1');
}

beforeEach((): void => {
    Object.assign(mocks.env, {
        VITE_API_URL: 'http://localhost:3333',
        VITE_GOOGLE_CLIENT_ID: 'google-client-test',
        VITE_FACEBOOK_APP_ID: 'facebook-app-test'
    });
    connectGoogle();
    server.use(http.get('*/signup-links/:token', (): Response => HttpResponse.json(PUBLIC_OFFER)));
});

afterEach((): void => {
    tokenStore.set(null);
    mocks.loadGoogle.mockReset();
    mocks.track.mockReset();
});

describe('entrar com oferta: sem sessão', () => {
    it('mostra o teste, a régua e a validade do link', async () => {
        await openOffer();

        expect(screen.getByText(/14 dias de Premium grátis, sem cartão/)).toBeInTheDocument();
        expect(screen.getByText('50% de desconto nos ciclos 1 a 3')).toBeInTheDocument();
        expect(screen.getByText('25% de desconto nos ciclos 4 a 6')).toBeInTheDocument();
        expect(screen.getByText('Este link vale até 31 de dezembro de 2026.')).toBeInTheDocument();
        expect(mocks.track).toHaveBeenCalledWith('offer_viewed');
    });

    it('entra com o token da oferta e vai para o Plano e uso quando a conta já existia', async () => {
        const bodies: unknown[] = [];
        server.use(
            http.post('*/auth/google', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return HttpResponse.json(loginSession({ isNewAccount: false, offer: { redeemed: true, reason: null } }));
            }),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity()))
        );
        const router: AnyRouter = await openOffer();

        await signInWithGoogle();

        expect(await screen.findByText('Oferta resgatada. Os detalhes estão em Plano e uso.')).toBeInTheDocument();
        expect(bodies).toEqual([{ idToken: 'google-token-1', offerToken: TOKEN }]);
        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/settings/plan');
        });
        expect(mocks.track).toHaveBeenCalledWith('offer_redeemed', { via: 'signup' });
    });

    it('conta nova resgata e segue para o início', async () => {
        server.use(
            http.post('*/auth/google', (): Response => HttpResponse.json(loginSession({ offer: { redeemed: true, reason: null } }))),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity()))
        );
        const router: AnyRouter = await openOffer();

        await signInWithGoogle();

        await waitFor((): void => {
            expect(router.state.location.pathname).not.toBe('/entrar');
        });
        expect(router.state.location.pathname).not.toBe('/settings/plan');
    });

    it('entra mas diz por que a oferta não foi resgatada', async () => {
        server.use(
            http.post('*/auth/google', (): Response =>
                HttpResponse.json(
                    loginSession({ isNewAccount: false, offer: { redeemed: false, reason: 'signup_links.email_already_used' } })
                )
            ),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity()))
        );
        await openOffer();

        await signInWithGoogle();

        expect(
            await screen.findByText(
                'Você entrou, mas a oferta não foi resgatada. Este e-mail já fez um teste grátis. O teste vale uma vez por e-mail.'
            )
        ).toBeInTheDocument();
        expect(mocks.track).toHaveBeenCalledWith('offer_failed', { code: 'signup_links.email_already_used' });
    });

    it('entra normalmente quando a API não devolve resultado da oferta', async () => {
        server.use(
            http.post('*/auth/google', (): Response => HttpResponse.json(loginSession({ offer: null }))),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity()))
        );
        const router: AnyRouter = await openOffer();

        await signInWithGoogle();

        await waitFor((): void => {
            expect(router.state.location.pathname).not.toBe('/entrar');
        });
        expect(mocks.track).not.toHaveBeenCalledWith('offer_redeemed', expect.anything());
    });

    it('mostra a mensagem de uma falha no login', async () => {
        server.use(http.post('*/auth/google', (): Response => HttpResponse.json(problem('core.too_many_attempts', 429), { status: 429 })));
        await openOffer();

        await signInWithGoogle();

        expect(await screen.findByText('Muitas ofertas resgatadas por este endereço hoje. Tente de novo amanhã.')).toBeInTheDocument();
    });

    it('link que não existe mais: explica e não oferece login social', async () => {
        server.use(
            http.get('*/signup-links/:token', (): Response => HttpResponse.json(problem('signup_links.not_found', 404), { status: 404 }))
        );
        renderRouterAt(`/entrar?oferta=${TOKEN}`);

        expect(await screen.findByText('Este link não está mais disponível. Peça um link novo.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Entrar sem a oferta' })).toHaveAttribute('href', '/login');
        expect(screen.queryByRole('group', { name: 'Continuar com Google' })).not.toBeInTheDocument();
    });

    it('sem o parâmetro da oferta, cai no login', async () => {
        const router: AnyRouter = renderRouterAt('/entrar');

        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/login');
        });
    });
});

describe('entrar com oferta: com sessão', () => {
    it('o Dono resgata, a oferta some do cache e vai para o Plano e uso', async () => {
        const user: UserEvent = userEvent.setup();
        const bodies: unknown[] = [];
        server.use(
            ...signedInHandlers(),
            http.post('*/billing/offer/redeem', async ({ request }): Promise<Response> => {
                bodies.push(await request.json());
                return HttpResponse.json(REDEEMED);
            })
        );
        const router: AnyRouter = await openOffer();

        await user.click(await screen.findByRole('button', { name: 'Resgatar a oferta' }));

        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/settings/plan');
        });
        expect(bodies).toEqual([{ token: TOKEN }]);
        expect(await screen.findByText('Oferta resgatada. Os detalhes estão em Plano e uso.')).toBeInTheDocument();
        expect(mocks.track).toHaveBeenCalledWith('offer_redeemed', { via: 'session' });
    });

    it('conta que não pode resgatar mostra o motivo', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            ...signedInHandlers(),
            http.post('*/billing/offer/redeem', (): Response =>
                HttpResponse.json(
                    { ...problem('signup_links.account_not_eligible', 409), meta: { reason: 'already_paid' } },
                    { status: 409 }
                )
            )
        );
        await openOffer();

        await user.click(await screen.findByRole('button', { name: 'Resgatar a oferta' }));

        expect(await screen.findByText('Esta conta já assinou o Premium. A oferta é só para quem nunca assinou.')).toBeInTheDocument();
        expect(mocks.track).toHaveBeenCalledWith('offer_failed', { code: 'signup_links.account_not_eligible' });
    });

    it('quem não é Dono não vê o botão', async () => {
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ role: 'editor' }))),
            ...signedInHandlers()
        );
        await openOffer();

        expect(await screen.findByText('Só o Dono da conta resgata a oferta. Peça ao Dono para abrir este link.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Resgatar a oferta' })).not.toBeInTheDocument();
    });
});
