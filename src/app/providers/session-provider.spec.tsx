import { StrictMode, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { tokenStore } from '@/shared/lib/api/token-store';
import { problem, sessionIdentity, sessionUser } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import type { SessionUser } from './session-context';
import { SessionProvider, useSession } from './session-provider';

function Probe(): ReactElement {
    const { user, isAuthenticated, isRestoring, signIn, signOut } = useSession();
    const maria: SessionUser = sessionUser({ id: 'maria', name: 'Maria' });
    const joao: SessionUser = sessionUser({ id: 'joao', name: 'João' });
    return (
        <div>
            <span>{isRestoring ? 'restaurando' : 'pronto'}</span>
            <span>{isAuthenticated ? `logada: ${user?.name ?? ''}` : 'anônima'}</span>
            <button
                type="button"
                onClick={(): void => {
                    signIn('token-maria', maria);
                }}
            >
                entrar maria
            </button>
            <button
                type="button"
                onClick={(): void => {
                    signIn('token-joao', joao);
                }}
            >
                entrar joão
            </button>
            <button type="button" onClick={signOut}>
                sair
            </button>
        </div>
    );
}

function renderProvider(client: QueryClient = new QueryClient(), strict: boolean = false): void {
    const tree: ReactElement = (
        <QueryClientProvider client={client}>
            <SessionProvider>
                <Probe />
            </SessionProvider>
        </QueryClientProvider>
    );
    render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

afterEach((): void => {
    tokenStore.set(null);
});

describe('SessionProvider restoration', () => {
    it('restores the session with the refresh cookie and the profile', async () => {
        server.use(...signedInHandlers('access-restored'));

        renderProvider();

        expect(await screen.findByText('logada: Maria Teste')).toBeInTheDocument();
        expect(screen.getByText('pronto')).toBeInTheDocument();
        expect(tokenStore.get()).toBe('access-restored');
    });

    it('stays signed out without an error when the refresh is refused', async () => {
        renderProvider();

        expect(await screen.findByText('pronto')).toBeInTheDocument();
        expect(screen.getByText('anônima')).toBeInTheDocument();
        expect(tokenStore.get()).toBeNull();
    });

    it('stays signed out and drops the token when the profile cannot be loaded', async () => {
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(problem('identity.unauthorized', 500), { status: 500 })),
            ...signedInHandlers()
        );

        renderProvider();

        expect(await screen.findByText('pronto')).toBeInTheDocument();
        expect(screen.getByText('anônima')).toBeInTheDocument();
        expect(tokenStore.get()).toBeNull();
    });

    it('renews the session only once under StrictMode', async () => {
        const refreshes: string[] = [];
        server.use(
            http.post('*/auth/refresh', (): Response => {
                refreshes.push('refresh');
                return HttpResponse.json({ outcome: 'authenticated', accessToken: 'access-once' });
            }),
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity()))
        );

        renderProvider(new QueryClient(), true);

        expect(await screen.findByText('logada: Maria Teste')).toBeInTheDocument();
        expect(refreshes).toHaveLength(1);
    });

    it('signs the person out when the token store is cleared', async () => {
        server.use(...signedInHandlers());
        renderProvider();
        await screen.findByText('logada: Maria Teste');

        act((): void => {
            tokenStore.set(null);
        });

        expect(screen.getByText('anônima')).toBeInTheDocument();
    });
});

describe('SessionProvider sign in and sign out', () => {
    it('keeps the token and the user after the sign in', async () => {
        const user: UserEvent = userEvent.setup();
        renderProvider();
        await screen.findByText('pronto');

        await user.click(screen.getByRole('button', { name: 'entrar maria' }));

        expect(screen.getByText('logada: Maria')).toBeInTheDocument();
        expect(tokenStore.get()).toBe('token-maria');
    });

    it('revokes the session, clears the token and drops the cache on sign out', async () => {
        const logouts: string[] = [];
        server.use(
            http.post('*/auth/logout', (): Response => {
                logouts.push('logout');
                return new HttpResponse(null, { status: 204 });
            })
        );
        const client: QueryClient = new QueryClient();
        client.setQueryData(['dados', 'maria'], { saldo: 10 });
        const user: UserEvent = userEvent.setup();
        renderProvider(client);
        await screen.findByText('pronto');
        await user.click(screen.getByRole('button', { name: 'entrar maria' }));

        await user.click(screen.getByRole('button', { name: 'sair' }));

        expect(screen.getByText('anônima')).toBeInTheDocument();
        expect(tokenStore.get()).toBeNull();
        expect(client.getQueryData(['dados', 'maria'])).toBeUndefined();
        await waitFor((): void => {
            expect(logouts).toEqual(['logout']);
        });
    });

    it('signs out locally even when the logout call fails', async () => {
        server.use(http.post('*/auth/logout', (): Response => HttpResponse.error()));
        const user: UserEvent = userEvent.setup();
        renderProvider();
        await screen.findByText('pronto');
        await user.click(screen.getByRole('button', { name: 'entrar maria' }));

        await user.click(screen.getByRole('button', { name: 'sair' }));

        expect(screen.getByText('anônima')).toBeInTheDocument();
        expect(tokenStore.get()).toBeNull();
    });

    it('never mixes the data of two people across sign in, sign out and sign in', async () => {
        const client: QueryClient = new QueryClient();
        const user: UserEvent = userEvent.setup();
        renderProvider(client);
        await screen.findByText('pronto');

        await user.click(screen.getByRole('button', { name: 'entrar maria' }));
        client.setQueryData(['dados'], { dono: 'maria' });
        await user.click(screen.getByRole('button', { name: 'sair' }));
        await user.click(screen.getByRole('button', { name: 'entrar joão' }));

        expect(client.getQueryData(['dados'])).toBeUndefined();
        expect(screen.getByText('logada: João')).toBeInTheDocument();
        expect(tokenStore.get()).toBe('token-joao');
    });

    it('requires the provider', () => {
        const silence: MockInstance<typeof console.error> = vi.spyOn(console, 'error').mockImplementation((): void => undefined);

        expect(() => render(<Probe />)).toThrow('useSession must be used inside SessionProvider');

        silence.mockRestore();
    });
});
