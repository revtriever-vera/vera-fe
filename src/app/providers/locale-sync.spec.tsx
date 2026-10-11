import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { i18n } from '@/shared/lib/i18n';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('LocaleSync', () => {
    it('applies the language of the session', async () => {
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))),
            ...signedInHandlers()
        );

        renderRouterAt('/');

        expect(await screen.findByRole('button', { name: 'Sign out' })).toBeInTheDocument();
        expect(i18n.language).toBe('en');
    });

    it('goes back to the browser language on sign out', async () => {
        vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt-BR');
        server.use(
            http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))),
            ...signedInHandlers()
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt('/');

        await user.click(await screen.findByRole('button', { name: 'Sign out' }));

        await waitFor(() => {
            expect(i18n.language).toBe('pt-BR');
        });
        expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('keeps the browser language while there is no session', async () => {
        renderRouterAt('/login');

        expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
        expect(i18n.language).toBe('pt-BR');
    });
});
