import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    type AnyRoute,
    type AnyRouter
} from '@tanstack/react-router';
import { useUnsavedGuard, type UnsavedGuard } from './use-unsaved-guard';

function Page({ dirty }: { readonly dirty: boolean }): React.ReactElement {
    const guard: UnsavedGuard = useUnsavedGuard(dirty);
    return (
        <div>
            <span>{guard.blocked ? 'bloqueado' : 'livre'}</span>
            <button type="button" onClick={guard.stay}>
                ficar
            </button>
            <button type="button" onClick={guard.leave}>
                sair
            </button>
        </div>
    );
}

function setup(dirty: boolean): AnyRouter {
    const root: AnyRoute = createRootRoute();
    const home: AnyRoute = createRoute({ getParentRoute: () => root, path: '/', component: () => <Page dirty={dirty} /> });
    const other: AnyRoute = createRoute({ getParentRoute: () => root, path: '/outra', component: () => <span>outra</span> });
    const router: AnyRouter = createRouter({
        routeTree: root.addChildren([home, other]),
        history: createMemoryHistory({ initialEntries: ['/'] })
    });
    render(<RouterProvider router={router} />);
    return router;
}

describe('useUnsavedGuard', () => {
    it('com alteração bloqueia e libera ao confirmar', async () => {
        const router: AnyRouter = setup(true);
        await screen.findByText('livre');

        void router.navigate({ to: '/outra' as never });
        expect(await screen.findByText('bloqueado')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');

        screen.getByRole('button', { name: 'sair' }).click();
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/outra');
        });
    });

    it('com alteração permite ficar', async () => {
        const router: AnyRouter = setup(true);
        await screen.findByText('livre');

        void router.navigate({ to: '/outra' as never });
        await screen.findByText('bloqueado');
        screen.getByRole('button', { name: 'ficar' }).click();

        expect(await screen.findByText('livre')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
    });

    it('sem alteração não interfere', async () => {
        const router: AnyRouter = setup(false);
        await screen.findByText('livre');

        await router.navigate({ to: '/outra' as never });

        expect(router.state.location.pathname).toBe('/outra');
    });
});
