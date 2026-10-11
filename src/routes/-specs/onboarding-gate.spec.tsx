import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../../../test/msw/server';
import { closedState, onboardingState } from '../../../test/fixtures/onboarding';
import { renderRouterAt } from '../../../test/router';
import { problem } from '../../../test/fixtures/auth';
import type { OnboardingState } from '@/features/onboarding/types';

function serveState(state: OnboardingState): void {
    server.use(http.get('*/onboarding', () => HttpResponse.json(state)));
}

describe('guarda do onboarding', () => {
    it('leva à tela cheia quando o onboarding está aberto e a rota é a porta de entrada', async () => {
        serveState(onboardingState());
        const router = renderRouterAt('/', { signedIn: true });

        expect(await screen.findByRole('heading', { level: 1, name: /Seu patrimônio e seus gastos/ })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/onboarding');
        expect(screen.queryByRole('navigation', { name: 'Navegação principal' })).not.toBeInTheDocument();
        expect(screen.getByRole('main', { name: 'Configuração inicial' })).toBeInTheDocument();
    });

    it.each(['/portfolio', '/portfolio/assets', '/portfolio/contribution'])(
        'não desvia %s com o onboarding aberto',
        async (path: string) => {
            serveState(onboardingState({ status: 'assets' }));
            const router = renderRouterAt(path, { signedIn: true });

            await screen.findByRole('navigation', { name: 'Navegação principal' });
            expect(router.state.location.pathname).toBe(path);
        }
    );

    it('mostra o atalho Continuar configuração no menu enquanto aberto', async () => {
        serveState(onboardingState({ status: 'banks' }));
        renderRouterAt('/portfolio', { signedIn: true });

        const link: HTMLElement = (await screen.findAllByRole('link', { name: 'Continuar configuração' }))[0] as HTMLElement;
        expect(link).toHaveAttribute('href', '/onboarding');
    });

    it('esconde o atalho e deixa o app em / quando o onboarding está fechado', async () => {
        const router = renderRouterAt('/', { signedIn: true });

        await screen.findByRole('navigation', { name: 'Navegação principal' });
        expect(router.state.location.pathname).toBe('/');
        expect(screen.queryByRole('link', { name: 'Continuar configuração' })).not.toBeInTheDocument();
    });

    it('manda para / quem abre uma rota do onboarding já fechado', async () => {
        const router = renderRouterAt('/onboarding/assets', { signedIn: true });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/');
        });
        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    });

    it('mostra só o fundo enquanto a primeira resposta não chega', async () => {
        server.use(
            http.get('*/onboarding', async () => {
                await delay('infinite');
                return HttpResponse.json(closedState());
            })
        );
        const router = renderRouterAt('/', { signedIn: true });

        await waitFor(() => {
            expect(router.state.status).toBe('idle');
        });
        await delay(50);
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
    });

    it('deixa entrar no app quando a consulta do estado falha com 5xx', async () => {
        server.use(http.get('*/onboarding', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        const router = renderRouterAt('/', { signedIn: true });

        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
    });

    it('/onboarding retoma pela etapa em aberto', async () => {
        serveState(onboardingState({ status: 'banks' }));
        const router = renderRouterAt('/onboarding', { signedIn: true });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/banks');
        });
    });

    it('/onboarding vai ao resumo quando só falta o Pronto', async () => {
        serveState(onboardingState({ status: 'summary' }));
        const router = renderRouterAt('/onboarding', { signedIn: true });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/done');
        });
    });

    it('mostra o aviso com nova tentativa quando o estado não carrega dentro do onboarding', async () => {
        server.use(http.get('*/onboarding', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        renderRouterAt('/onboarding', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a configuração inicial.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });
});
