import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import * as analytics from '@/shared/lib/analytics';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { BillingMe } from '@/features/billing/types';
import { billingMe, freeBilling, selfHostedBilling } from '../../../test/fixtures/billing';
import { signedInHandlers } from '../../../test/msw/handlers/auth.handlers';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const NAV_LABEL: string = 'Seções de configurações';

async function settingsNav(): Promise<HTMLElement> {
    await screen.findByRole('heading', { name: 'Configurações', level: 1 });
    return screen.findByRole('navigation', { name: NAV_LABEL });
}

function activeTabs(nav: HTMLElement): string[] {
    return within(nav)
        .getAllByRole('link')
        .filter((link: HTMLElement): boolean => link.getAttribute('aria-current') === 'page')
        .map((link: HTMLElement): string => link.textContent ?? '');
}

afterEach((): void => {
    tokenStore.set(null);
    vi.restoreAllMocks();
});

describe('rota /settings', () => {
    it('/settings cai em Plano e uso na versão hospedada', async () => {
        const router: AnyRouter = renderRouterAt('/settings', { signedIn: true });

        const nav: HTMLElement = await settingsNav();

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/settings/plan');
        });
        expect(activeTabs(nav)).toEqual(['Plano e uso']);
        expect(screen.getByText('Plano, integrações e os seus dados.')).toBeInTheDocument();
    });

    it('lista as sete abas da versão hospedada, sem Integrações', async () => {
        renderRouterAt('/settings/preferences', { signedIn: true });

        const nav: HTMLElement = await settingsNav();

        expect(
            within(nav)
                .getAllByRole('link')
                .map((link: HTMLElement): string => link.textContent ?? '')
        ).toEqual(['Plano e uso', 'Pessoas', 'WhatsApp', 'Google Agenda', 'Bancos', 'Preferências', 'Dados e privacidade']);
        expect(activeTabs(nav)).toEqual(['Preferências']);
    });

    it.each(['/settings/nada', '/settings/integrations'])('%s volta para a primeira aba', async (path: string) => {
        const router: AnyRouter = renderRouterAt(path, { signedIn: true });

        await settingsNav();

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/settings/plan');
        });
    });

    it.each([
        ['/account', '/settings/preferences'],
        ['/plans', '/settings/plan'],
        ['/spending/connections', '/settings/banks']
    ])('%s redireciona para %s', async (from: string, to: string) => {
        const router: AnyRouter = renderRouterAt(from, { signedIn: true });

        await settingsNav();

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(to);
        });
    });

    it('as abas navegam entre as seções', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/settings/plan', { signedIn: true });
        const nav: HTMLElement = await settingsNav();

        await user.click(within(nav).getByRole('link', { name: 'Dados e privacidade' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/settings/privacy');
        });
        expect(await screen.findByRole('button', { name: 'Exportar' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Excluir conta' })).toBeInTheDocument();
    });

    it('Preferências mostra o idioma da interface', async () => {
        renderRouterAt('/settings/preferences', { signedIn: true });

        expect(await screen.findByRole('combobox', { name: 'Idioma da interface' })).toHaveTextContent('Português (Brasil)');
    });

    it('registra settings_viewed com a aba aberta', async () => {
        const track: MockInstance<typeof analytics.track> = vi.spyOn(analytics, 'track');
        renderRouterAt('/settings/banks', { signedIn: true });

        await settingsNav();

        await waitFor(() => {
            expect(track).toHaveBeenCalledWith('settings_viewed', { tab: 'banks' });
        });
    });
});

describe('Bancos', () => {
    it('mostra o passo a passo, as credenciais e a área de soltar', async () => {
        renderRouterAt('/settings/banks', { signedIn: true });

        expect(await screen.findByRole('region', { name: 'Suas credenciais' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Importar extrato' })).toBeInTheDocument();
        expect(screen.getByText('Arraste o extrato aqui')).toBeInTheDocument();
        expect(screen.getByText('OFX ou CSV, até 5 MB')).toBeInTheDocument();
    });

    it('recusa um PDF com a mensagem de formato', async () => {
        const user: UserEvent = userEvent.setup({ applyAccept: false });
        renderRouterAt('/settings/banks', { signedIn: true });
        const input: HTMLElement = await screen.findByLabelText('Arquivo do extrato');

        await user.upload(input, new File(['%PDF'], 'extrato.pdf', { type: 'application/pdf' }));

        expect(await screen.findByText('Use um arquivo OFX ou CSV')).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('esconde as credenciais de quem não é o dono', async () => {
        server.use(
            http.get('*/auth/me', () =>
                HttpResponse.json({
                    id: 'u1',
                    companyId: 'c1',
                    name: 'Pedro Membro',
                    email: 'pedro@example.test',
                    role: 'member',
                    locale: 'pt-BR',
                    preferredLocale: null,
                    loginProvider: 'google',
                    companyName: 'Casa'
                })
            ),
            ...signedInHandlers()
        );
        renderRouterAt('/settings/banks');

        expect(await screen.findByText('Só o dono da conta cadastra e troca as credenciais do Meu Pluggy.')).toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Suas credenciais' })).not.toBeInTheDocument();
    });
});

describe('menu do avatar', () => {
    beforeEach((): void => {
        vi.spyOn(analytics, 'track');
    });

    async function openMenu(user: UserEvent, me: BillingMe = freeBilling()): Promise<HTMLElement> {
        server.use(http.get('*/billing/me', () => HttpResponse.json(me)));
        renderRouterAt('/portfolio', { signedIn: true });
        const [trigger] = await screen.findAllByRole('button', { name: 'Abrir menu da conta' });
        await user.click(trigger as HTMLElement);
        return screen.findByRole('menu', { name: 'Abrir menu da conta' });
    }

    it('mostra o selo Premium para quem assina', async () => {
        const menu: HTMLElement = await openMenu(userEvent.setup(), billingMe());

        expect(await within(menu).findByText('Premium')).toBeInTheDocument();
        expect(within(menu).queryByText('Free')).not.toBeInTheDocument();
    });

    it('não mostra selo de plano na auto-hospedada', async () => {
        const menu: HTMLElement = await openMenu(userEvent.setup(), selfHostedBilling());

        await within(menu).findByRole('menuitem', { name: 'Configurações' });
        expect(within(menu).queryByText('Free')).not.toBeInTheDocument();
        expect(within(menu).queryByText('Premium')).not.toBeInTheDocument();
    });

    it('abre com nome, provedor, Plano e uso, Configurações e Sair, e põe o foco no primeiro item', async () => {
        const user: UserEvent = userEvent.setup();

        const menu: HTMLElement = await openMenu(user);

        expect(within(menu).getByText(/via Google/)).toBeInTheDocument();
        expect(within(menu).getByRole('menuitem', { name: /Plano e uso/ })).toBeInTheDocument();
        expect(await within(menu).findByText('Free')).toBeInTheDocument();
        expect(within(menu).getByRole('menuitem', { name: 'Configurações' })).toBeInTheDocument();
        await waitFor(() => {
            expect(within(menu).getByRole('menuitem', { name: /Plano e uso/ })).toHaveFocus();
        });
        expect(analytics.track).toHaveBeenCalledWith('user_menu_opened');
    });

    it('fecha com Esc e com clique fora', async () => {
        const user: UserEvent = userEvent.setup();
        await openMenu(user);

        await user.keyboard('{Escape}');
        await waitFor(() => {
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        const [trigger] = screen.getAllByRole('button', { name: 'Abrir menu da conta' });
        await user.click(trigger as HTMLElement);
        await screen.findByRole('menu', { name: 'Abrir menu da conta' });
        fireEvent.pointerDown(document.body);
        await waitFor(() => {
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });
    });

    it('Configurações leva à primeira aba', async () => {
        const user: UserEvent = userEvent.setup();
        const menu: HTMLElement = await openMenu(user);

        await user.click(within(menu).getByRole('menuitem', { name: 'Configurações' }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Configurações', level: 1 })).toBeInTheDocument();
        });
    });

    it('Sair encerra a sessão e vai ao login', async () => {
        server.use(http.post('*/auth/logout', () => new HttpResponse(null, { status: 204 })));
        const user: UserEvent = userEvent.setup();
        const menu: HTMLElement = await openMenu(user);

        await user.click(within(menu).getByRole('menuitem', { name: 'Sair' }));

        await waitFor(() => {
            expect(tokenStore.get()).toBeNull();
        });
    });
});
