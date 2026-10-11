import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { server } from '../../../test/msw/server';
import { closedState, onboardingState, onboardingSummary } from '../../../test/fixtures/onboarding';
import { problem, sessionIdentity } from '../../../test/fixtures/auth';
import { renderRouterAt } from '../../../test/router';
import type { OnboardingSummary } from '@/features/onboarding/types';

function serveSummary(summary: OnboardingSummary): void {
    server.use(
        http.get('*/onboarding', () => HttpResponse.json(onboardingState({ status: 'summary' }))),
        http.get('*/onboarding/summary', () => HttpResponse.json(summary))
    );
}

const FILLED: OnboardingSummary = onboardingSummary({
    assets: { items: 3, amountCents: 1234567, currency: 'BRL' },
    banks: { items: 3, amountCents: null, currency: null, breakdown: { connections: 2, imports: 1 } },
    target: { items: 8, amountCents: null, currency: null }
});

describe('Pronto', () => {
    it('com tudo preenchido mostra o resumo, o valor formatado e o breakdown dos bancos', async () => {
        serveSummary(FILLED);
        renderRouterAt('/onboarding/done', { signedIn: true });

        expect(await screen.findByRole('heading', { level: 1, name: 'Tudo pronto' })).toBeInTheDocument();
        expect(await screen.findByText(/3 ativos cadastrados · R\$\s?12\.345,67/)).toBeInTheDocument();
        expect(screen.getByText('3 fontes de gastos')).toBeInTheDocument();
        expect(screen.getByText('2 conexões bancárias · 1 extrato importado')).toBeInTheDocument();
        expect(screen.getByText('Carteira-alvo moderada como ponto de partida')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Cadastrar agora' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Conectar agora' })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    });

    it('formata o valor no idioma da sessão', async () => {
        server.use(
            http.post('*/auth/refresh', () => HttpResponse.json({ outcome: 'authenticated', accessToken: 'access-token-1' })),
            http.get('*/auth/me', () => HttpResponse.json(sessionIdentity({ locale: 'en' })))
        );
        serveSummary(FILLED);
        renderRouterAt('/onboarding/done');

        expect(await screen.findByText(/3 assets added · R\$12,345\.67/)).toBeInTheDocument();
        expect(screen.getByText('2 bank connections · 1 statement imported')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: 'All set' })).toBeInTheDocument();
    });

    it('com tudo pulado mostra Pronto para começar e os atalhos Cadastrar agora e Conectar agora', async () => {
        serveSummary(
            onboardingSummary({
                assets: { items: 0, amountCents: null, currency: null },
                banks: { items: 0, amountCents: null, currency: null }
            })
        );
        const router: AnyRouter = renderRouterAt('/onboarding/done', { signedIn: true });

        expect(await screen.findByRole('heading', { level: 1, name: 'Pronto para começar' })).toBeInTheDocument();
        expect(screen.getByText(/Você pulou as duas etapas/)).toBeInTheDocument();
        expect(await screen.findByText('Ativos: para depois')).toBeInTheDocument();
        expect(screen.getByText('Bancos: para depois')).toBeInTheDocument();
        expect(screen.queryByText('Carteira-alvo moderada como ponto de partida')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('link', { name: 'Conectar agora' }));
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/banks');
        });
    });

    it('Cadastrar agora volta à etapa de ativos', async () => {
        serveSummary(onboardingSummary({ assets: { items: 0, amountCents: null, currency: null } }));
        const router: AnyRouter = renderRouterAt('/onboarding/done', { signedIn: true });

        await userEvent.click(await screen.findByRole('link', { name: 'Cadastrar agora' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/assets');
        });
    });

    it('a linha some quando a API devolve null, e os ativos sem valor mostram só a contagem', async () => {
        serveSummary(onboardingSummary({ assets: { items: 1, amountCents: null, currency: null }, banks: null, target: null }));
        renderRouterAt('/onboarding/done', { signedIn: true });

        expect(await screen.findByText('1 ativo cadastrado')).toBeInTheDocument();
        expect(screen.queryByText(/Bancos/)).not.toBeInTheDocument();
        expect(screen.queryByText('Carteira-alvo moderada como ponto de partida')).not.toBeInTheDocument();
    });

    it('mostra o detalhe padrão quando os bancos vêm sem breakdown', async () => {
        serveSummary(onboardingSummary({ banks: { items: 2, amountCents: null, currency: null } }));
        renderRouterAt('/onboarding/done', { signedIn: true });

        expect(await screen.findByText('Seus gastos aparecem no resumo do mês.')).toBeInTheDocument();
    });

    it('a linha de ativos some com assets null', async () => {
        serveSummary(onboardingSummary({ banks: { items: 1, amountCents: null, currency: null }, assets: null }));
        renderRouterAt('/onboarding/done', { signedIn: true });

        await screen.findByText('1 fonte de gastos');
        expect(screen.queryByText(/Ativos/)).not.toBeInTheDocument();
    });

    it('Ir para o painel chama finish e vai à Visão geral', async () => {
        serveSummary(FILLED);
        let finished: number = 0;
        server.use(
            http.post('*/onboarding/finish', () => {
                finished += 1;
                return HttpResponse.json(closedState({ dismissedAt: null, completedAt: '2026-10-01T12:00:00.000Z' }));
            })
        );
        const router: AnyRouter = renderRouterAt('/onboarding/done', { signedIn: true });

        await screen.findByText('3 fontes de gastos');
        await userEvent.click(screen.getByRole('button', { name: 'Ir para o painel' }));

        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/patrimonio');
        });
        expect(finished).toBe(1);
        expect(screen.queryByRole('link', { name: 'Continuar configuração' })).not.toBeInTheDocument();
    });

    it('sem ativos mas com gastos, o painel é o resumo de gastos', async () => {
        serveSummary(
            onboardingSummary({
                assets: { items: 0, amountCents: null, currency: null },
                banks: { items: 1, amountCents: null, currency: null }
            })
        );
        const router: AnyRouter = renderRouterAt('/onboarding/done', { signedIn: true });

        await screen.findByText('1 fonte de gastos');
        await userEvent.click(screen.getByRole('button', { name: 'Ir para o painel' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/');
        });
        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    });

    it('permite ir ao painel mesmo quando o resumo falha, com aviso e nova tentativa', async () => {
        server.use(
            http.get('*/onboarding', () => HttpResponse.json(onboardingState({ status: 'summary' }))),
            http.get('*/onboarding/summary', () => HttpResponse.json(problem('core.internal', 500), { status: 500 }))
        );
        renderRouterAt('/onboarding/done', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar o resumo.')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: 'Pronto para começar' })).toBeInTheDocument();
        server.use(http.get('*/onboarding/summary', () => HttpResponse.json(FILLED)));
        await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('3 fontes de gastos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Ir para o painel' })).toBeInTheDocument();
    });

    it('um 409 já encerrado no finish segue para /', async () => {
        serveSummary(FILLED);
        let closed: boolean = false;
        server.use(
            http.get('*/onboarding', () => HttpResponse.json(closed ? closedState() : onboardingState({ status: 'summary' }))),
            http.post('*/onboarding/finish', () => {
                closed = true;
                return HttpResponse.json(problem('onboarding.already_closed', 409), { status: 409 });
            })
        );
        const router: AnyRouter = renderRouterAt('/onboarding/done', { signedIn: true });

        await screen.findByText('3 fontes de gastos');
        await userEvent.click(screen.getByRole('button', { name: 'Ir para o painel' }));

        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
    });
});
