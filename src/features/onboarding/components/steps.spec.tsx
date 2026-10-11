import { track as trackEvent } from '@/shared/lib/analytics';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    type AnyRoute,
    type AnyRouter
} from '@tanstack/react-router';
import { ToastProvider } from '@/app/providers/toast-provider';
import { i18n } from '@/shared/lib/i18n';
import { server } from '../../../../test/msw/server';
import { onboardingState, onboardingSummary } from '../../../../test/fixtures/onboarding';
import { problem } from '../../../../test/fixtures/auth';
import { AssetsStep, type AssetsStepSlots } from './assets-step';
import { BanksStep } from './banks-step';

const NOW: string = '2026-10-01T12:00:00.000Z';

function renderStep(path: string, element: ReactElement): AnyRouter {
    const root: AnyRoute = createRootRoute();
    const paths: readonly string[] = [path, '/onboarding/banks', '/onboarding/done', '/spending/connections', '/'];
    const routes: AnyRoute[] = [...new Set(paths)].map((p: string) =>
        createRoute({
            getParentRoute: () => root,
            path: p,
            component: p === path ? (): ReactElement => element : (): ReactElement => <p>{p}</p>
        })
    );
    const router: AnyRouter = createRouter({
        routeTree: root.addChildren(routes),
        history: createMemoryHistory({ initialEntries: [path] })
    });
    const client: QueryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(
        <QueryClientProvider client={client}>
            <ToastProvider>
                <RouterProvider router={router} />
            </ToastProvider>
        </QueryClientProvider>
    );
    return router;
}

interface Tracker {
    readonly calls: () => number;
}

function track(step: 'assets' | 'banks', action: 'complete' | 'skip'): Tracker {
    let count: number = 0;
    server.use(
        http.post(`*/onboarding/steps/${step}/${action}`, () => {
            count += 1;
            return HttpResponse.json(onboardingState({ status: 'banks' }));
        })
    );
    return { calls: (): number => count };
}

const WITH_SLOTS = (assetCount: number): AssetsStepSlots => ({
    typePicker: <p>tipos</p>,
    wallet: <p>carteira</p>,
    assetCount
});

describe('AssetsStep', () => {
    it('sem encaixes mostra o estado em breve e pular grava e vai a bancos', async () => {
        const skip: Tracker = track('assets', 'skip');
        const complete: Tracker = track('assets', 'complete');
        const router: AnyRouter = renderStep('/onboarding/assets', <AssetsStep typePicker={null} wallet={null} assetCount={0} />);

        expect(await screen.findByText('O cadastro de ativos chega em breve')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: 'Cadastre seus investimentos' })).toHaveFocus();
        expect(screen.queryByRole('button', { name: /Continuar/ })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Pular por enquanto' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/banks');
        });
        expect(skip.calls()).toBe(1);
        expect(complete.calls()).toBe(0);
        expect(trackEvent).toHaveBeenCalledWith('onboarding_step_skipped', { step: 'assets' });
        expect(trackEvent).toHaveBeenCalledWith('portfolio_onboarding_assets_step', { count: 0 });
    });

    it('lista os três motivos e a nota do cadastro manual', async () => {
        renderStep('/onboarding/assets', <AssetsStep {...WITH_SLOTS(0)} />);

        expect(await screen.findByText('Por que essa etapa existe')).toBeInTheDocument();
        for (const title of ['Ver tudo somado', 'Comparar com a sua meta', 'Saber onde aportar', 'Por que o cadastro é manual?']) {
            expect(screen.getByText(title)).toBeInTheDocument();
        }
        expect(screen.getByText('Etapa 1 de 2 · opcional')).toBeInTheDocument();
    });

    it('com encaixes e zero ativos oferece só o Pular por enquanto', async () => {
        renderStep('/onboarding/assets', <AssetsStep {...WITH_SLOTS(0)} />);

        expect(await screen.findByText('tipos')).toBeInTheDocument();
        expect(screen.getByText('carteira')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Sua carteira (0)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pular por enquanto' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Pular' })).not.toBeInTheDocument();
    });

    it('com três ativos mostra Pular e Continuar com 3 ativos; Continuar grava e navega', async () => {
        const complete: Tracker = track('assets', 'complete');
        const router: AnyRouter = renderStep('/onboarding/assets', <AssetsStep {...WITH_SLOTS(3)} />);

        expect(await screen.findByRole('button', { name: 'Pular' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Continuar com 3 ativos' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/banks');
        });
        expect(complete.calls()).toBe(1);
        expect(trackEvent).toHaveBeenCalledWith('portfolio_onboarding_assets_step', { count: 3 });
        expect(trackEvent).toHaveBeenCalledWith('onboarding_step_completed', { step: 'assets' });
        expect(trackEvent).toHaveBeenCalledWith('onboarding_step_viewed', { step: 'assets' });
    });

    it('usa o singular com um ativo e o inglês quando o idioma muda', async () => {
        renderStep('/onboarding/assets', <AssetsStep {...WITH_SLOTS(1)} />);
        expect(await screen.findByRole('button', { name: 'Continuar com 1 ativo' })).toBeInTheDocument();
        await i18n.changeLanguage('en');
        expect(await screen.findByRole('button', { name: 'Continue with 1 asset' })).toBeInTheDocument();
        await i18n.changeLanguage('pt-BR');
    });

    it('no inglês usa o plural', async () => {
        await i18n.changeLanguage('en');
        renderStep('/onboarding/assets', <AssetsStep {...WITH_SLOTS(2)} />);
        expect(await screen.findByRole('button', { name: 'Continue with 2 assets' })).toBeInTheDocument();
    });

    it('já fechado: a falha 409 não deixa a pessoa presa', async () => {
        server.use(
            http.post('*/onboarding/steps/assets/skip', () =>
                HttpResponse.json(problem('onboarding.already_closed', 409), { status: 409 })
            ),
            http.get('*/onboarding', () => HttpResponse.json(onboardingState({ status: 'closed', dismissedAt: NOW })))
        );
        const router: AnyRouter = renderStep('/onboarding/assets', <AssetsStep {...WITH_SLOTS(0)} />);

        await userEvent.click(await screen.findByRole('button', { name: 'Pular por enquanto' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/');
        });
    });
});

describe('BanksStep', () => {
    it('renderiza os quatro passos em lista ordenada e links externos seguros', async () => {
        renderStep('/onboarding/banks', <BanksStep connectionsLink="/spending/connections" />);

        const steps: HTMLElement = (await screen.findByText(/Crie sua conta e conecte seus bancos em/)).closest('ol') as HTMLElement;
        expect(steps.tagName).toBe('OL');
        expect(within(steps).getAllByRole('listitem')).toHaveLength(4);
        fireEvent.click(screen.getByRole('link', { name: 'meu.pluggy.ai' }));
        expect(trackEvent).toHaveBeenCalledWith('onboarding_pluggy_link_clicked', { target: 'meu' });
        for (const host of ['meu.pluggy.ai', 'dashboard.pluggy.ai']) {
            const link: HTMLElement = screen.getByRole('link', { name: host });
            expect(link).toHaveAttribute('href', `https://${host}`);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
        expect(screen.getByText('Etapa 2 de 2 · opcional')).toBeInTheDocument();
        expect(screen.getByText('15 dias de teste')).toBeInTheDocument();
        expect(screen.queryByText(/somente leitura/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Client ID/)).not.toBeInTheDocument();
        expect(document.querySelector('input')).toBeNull();
    });

    it('Ir para Conexões navega sem chamar complete nem skip', async () => {
        const complete: Tracker = track('banks', 'complete');
        const skip: Tracker = track('banks', 'skip');
        const router: AnyRouter = renderStep('/onboarding/banks', <BanksStep connectionsLink="/spending/connections" />);

        await userEvent.click(await screen.findByRole('link', { name: /Ir para Conexões/ }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/spending/connections');
        });
        expect(complete.calls()).toBe(0);
        expect(skip.calls()).toBe(0);
        expect(trackEvent).toHaveBeenCalledWith('onboarding_connections_opened');
    });

    it('sem destino o botão fica desabilitado com a dica e Pular continua valendo', async () => {
        const skip: Tracker = track('banks', 'skip');
        const router: AnyRouter = renderStep('/onboarding/banks', <BanksStep connectionsLink={null} />);

        const button: HTMLElement = await screen.findByRole('button', { name: 'Ir para Conexões' });
        expect(button).toBeDisabled();
        expect(button).toHaveAccessibleDescription('Disponível em breve');

        await userEvent.click(screen.getByRole('button', { name: 'Pular por enquanto' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/done');
        });
        expect(skip.calls()).toBe(1);
    });

    it('sem nada conectado só mostra Pular por enquanto e o Voltar', async () => {
        server.use(http.get('*/onboarding/summary', () => HttpResponse.json(onboardingSummary())));
        renderStep('/onboarding/banks', <BanksStep connectionsLink="/spending/connections" />);

        expect(await screen.findByRole('button', { name: 'Pular por enquanto' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/onboarding/assets');
    });

    it('com bancos conectados mostra a contagem e Continuar grava e vai ao Pronto', async () => {
        server.use(
            http.get('*/onboarding/summary', () =>
                HttpResponse.json(
                    onboardingSummary({ banks: { items: 3, amountCents: null, currency: null, breakdown: { connections: 2, imports: 1 } } })
                )
            )
        );
        const complete: Tracker = track('banks', 'complete');
        const router: AnyRouter = renderStep('/onboarding/banks', <BanksStep connectionsLink="/spending/connections" />);

        expect(await screen.findByText('Bancos conectados')).toBeInTheDocument();
        expect(screen.getByText('2 conexões bancárias · 1 extrato importado')).toBeInTheDocument();
        expect(screen.queryByText(/Crie sua conta/)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/done');
        });
        expect(complete.calls()).toBe(1);
    });
});
