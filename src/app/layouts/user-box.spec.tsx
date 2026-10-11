import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { tokenStore } from '@/shared/lib/api/token-store';
import { i18n } from '@/shared/lib/i18n';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';
import type { AnyRouter, RouterHistory } from '@tanstack/react-router';
import type { SessionIdentity } from '@/features/auth/types';

function signedInAs(overrides: Partial<SessionIdentity>): void {
    server.use(
        http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity(overrides))),
        ...signedInHandlers()
    );
}

async function userBox(): Promise<HTMLElement> {
    return screen.findByRole('group', { name: 'Conta' });
}

describe('UserBox', () => {
    it.each([
        ['Ágata Silva', 'Á'],
        ['😀 Sorriso', '😀'],
        ['X', 'X']
    ])('shows the initial of %s', async (name: string, initial: string) => {
        signedInAs({ name });
        renderRouterAt('/');

        const box: HTMLElement = await userBox();

        expect(box).toHaveTextContent(initial);
        expect(box).toHaveTextContent(name);
    });

    it('shows the provider in the current language', async () => {
        signedInAs({ loginProvider: 'facebook' });
        renderRouterAt('/');

        expect(await userBox()).toHaveTextContent('via Facebook');
        await i18n.changeLanguage('en');
        expect(await screen.findByRole('group', { name: 'Account' })).toHaveTextContent('via Facebook');
    });

    it('shows via Google for a Google login', async () => {
        renderRouterAt('/', { signedIn: true });

        expect(await userBox()).toHaveTextContent('via Google');
    });

    it('opens the account when the name is clicked', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/', { signedIn: true });

        await user.click(await screen.findByRole('link', { name: 'Abrir minha conta' }));

        expect(router.state.location.pathname).toBe('/account');
    });

    it('signs out, clears the cache, goes to the login and the back button does not reopen the app', async () => {
        const logouts: string[] = [];
        server.use(
            http.post('*/auth/logout', (): Response => {
                logouts.push('logout');
                return new HttpResponse(null, { status: 204 });
            })
        );
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Sair' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/login');
        });
        expect(router.state.location.search).toEqual({});
        expect(tokenStore.get()).toBeNull();
        expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
        await waitFor(() => {
            expect(logouts).toEqual(['logout']);
        });

        (router.history as RouterHistory).back();

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/login');
        });
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('signs out locally even when the logout call fails', async () => {
        server.use(http.post('*/auth/logout', (): Response => HttpResponse.error()));
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/', { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Sair' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/login');
        });
        expect(tokenStore.get()).toBeNull();
    });
});
