import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import { renderRouterAt } from '../../../test/router';

describe('authenticated routes guard', () => {
    it('sends a signed-out visit to the login keeping the requested path', async () => {
        const router = renderRouterAt('/');

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/login');
        });
        expect(router.state.location.search).toEqual({ redirect: '/' });
        expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('keeps the query in the redirect', async () => {
        const router = renderRouterAt('/?x=1');

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/login');
        });
        expect(router.state.location.search).toEqual({ redirect: '/?x=1' });
    });

    it('opens the route with the shell when the session is restored', async () => {
        const router = renderRouterAt('/', { signedIn: true });

        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
        expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
    });

    it('shows neither the login nor the protected content while restoring', () => {
        renderRouterAt('/', { signedIn: true });

        expect(screen.queryByRole('heading', { name: 'Entrar' })).not.toBeInTheDocument();
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('keeps every route except the login and the dev gallery behind the guard', () => {
        const ids: string[] = Object.keys(createRouter({ routeTree }).routesById).filter((id: string): boolean => id !== '__root__');

        const exposed: string[] = ids.filter(
            (id: string): boolean => id !== '/login' && !id.startsWith('/_dev') && id !== '/_auth' && !id.startsWith('/_auth/')
        );

        expect(exposed).toEqual([]);
    });
});
