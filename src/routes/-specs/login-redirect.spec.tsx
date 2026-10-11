import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderRouterAt } from '../../../test/router';

describe('login redirect', () => {
    it('goes to the requested internal path when already signed in', async () => {
        const router = renderRouterAt('/login?redirect=/extra', { signedIn: true });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/extra');
        });
    });

    it.each(['https://x.test', '//x.test', '/\\x', 'javascript:alert(1)'])(
        'ignores the dangerous redirect %s',
        async (redirect: string) => {
            const router = renderRouterAt(`/login?redirect=${encodeURIComponent(redirect)}`, { signedIn: true });

            expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
            expect(router.state.location.pathname).toBe('/');
        }
    );
});
