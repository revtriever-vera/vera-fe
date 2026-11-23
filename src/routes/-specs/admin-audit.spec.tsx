import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { auditEntry } from '../../../test/fixtures/admin';
import { problem } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

describe('Admin audit route', () => {
    it('sends a visitor without a session to the admin login', async () => {
        const router: AnyRouter = renderRouterAt('/admin/audit');

        expect(await screen.findByRole('heading', { name: 'Admin da Vera' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/admin/login');
    });

    it('lists the trail with the menu of the admin', async () => {
        server.use(http.get('*/platform/audit', () => HttpResponse.json({ items: [auditEntry()] })));
        renderRouterAt('/admin/audit', { signedIn: true });

        expect(await screen.findByText('admin.login')).toBeInTheDocument();
        expect(screen.getByText('22222222-2222-4222-8222-222222222222')).toBeInTheDocument();
        expect(screen.getByText('Nenhuma')).toBeInTheDocument();
        const menu: HTMLElement = screen.getByRole('navigation', { name: 'Admin' });
        expect(menu).toHaveTextContent('Links de cadastro');
        expect(menu).toHaveTextContent('Contas');
        expect(menu).toHaveTextContent('Auditoria');
    });

    it('shows the empty state when there is no event', async () => {
        server.use(http.get('*/platform/audit', () => HttpResponse.json({ items: [] })));
        renderRouterAt('/admin/audit', { signedIn: true });

        expect(await screen.findByText('Nenhum evento ainda')).toBeInTheDocument();
    });

    it('refuses a session that is not of the system company', async () => {
        server.use(http.get('*/platform/audit', () => HttpResponse.json(problem('identity.platform_only', 403), { status: 403 })));
        renderRouterAt('/admin/audit', { signedIn: true });

        expect(await screen.findByText('Sem acesso ao admin')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Auditoria' })).not.toBeInTheDocument();
    });

    it('tells that a self-hosted installation has no admin', async () => {
        server.use(http.get('*/platform/audit', () => HttpResponse.json(problem('identity.platform_disabled', 404), { status: 404 })));
        renderRouterAt('/admin/audit', { signedIn: true });

        expect(await screen.findByText('Admin indisponível')).toBeInTheDocument();
    });

    it('shows a failure when the trail does not load', async () => {
        server.use(http.get('*/platform/audit', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        renderRouterAt('/admin/audit', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a auditoria.')).toBeInTheDocument();
    });

    it('redirects the admin root to the audit', async () => {
        server.use(http.get('*/platform/audit', () => HttpResponse.json({ items: [] })));
        const router: AnyRouter = renderRouterAt('/admin', { signedIn: true });

        await waitFor((): void => {
            expect(router.state.location.pathname).toBe('/admin/audit');
        });
    });
});
