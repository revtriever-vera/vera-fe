import { describe, expect, it } from 'vitest';
import { track } from '@/shared/lib/analytics';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { server } from '../../../test/msw/server';
import { closedState, onboardingState } from '../../../test/fixtures/onboarding';
import { problem } from '../../../test/fixtures/auth';
import { renderRouterAt } from '../../../test/router';
import type { OnboardingState } from '@/features/onboarding/types';

function serveState(state: OnboardingState): void {
    server.use(http.get('*/onboarding', () => HttpResponse.json(state)));
}

function countCalls(method: 'post', path: string, response: () => Response): { readonly calls: () => number } {
    let count: number = 0;
    server.use(
        http[method](path, () => {
            count += 1;
            return response();
        })
    );
    return { calls: (): number => count };
}

describe('boas-vindas', () => {
    it('mostra a etiqueta neutra, os dois caminhos e o Começar sem o exemplo quando indisponível', async () => {
        serveState(onboardingState());
        renderRouterAt('/onboarding', { signedIn: true });

        expect(await screen.findByText('Boas-vindas à Vera')).toBeInTheDocument();
        expect(screen.getByText('1. Cadastrar seus ativos')).toBeInTheDocument();
        expect(screen.getByText('2. Conectar seus bancos')).toBeInTheDocument();
        expect(screen.getByText('~5 min')).toBeInTheDocument();
        expect(screen.getByText('~15 min')).toBeInTheDocument();
        expect(screen.getByText('de verdade')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Só explorar com dados de exemplo' })).not.toBeInTheDocument();
        expect(screen.queryByRole('list', { name: 'Progresso da configuração' })).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    });

    it('Começar chama start e vai à etapa de ativos', async () => {
        serveState(onboardingState());
        const start = countCalls('post', '*/onboarding/start', () => HttpResponse.json(onboardingState({ status: 'assets' })));
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        await userEvent.click(await screen.findByRole('button', { name: 'Começar' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/assets');
        });
        expect(start.calls()).toBe(1);
        expect(track).toHaveBeenCalledWith('onboarding_started');
        expect(track).toHaveBeenCalledWith('onboarding_step_viewed', { step: 'welcome' });
        expect(await screen.findByRole('heading', { level: 1, name: 'Cadastre seus investimentos' })).toBeInTheDocument();
    });

    it('mostra o erro traduzido quando o Começar falha', async () => {
        serveState(onboardingState());
        server.use(http.post('*/onboarding/start', () => HttpResponse.json(problem('core.too_many_attempts', 429), { status: 429 })));
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        await userEvent.click(await screen.findByRole('button', { name: 'Começar' }));

        expect(await screen.findByText('Muitas tentativas. Aguarde alguns minutos e tente de novo.')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/onboarding');
    });

    it('com exemplo disponível, carrega o exemplo, avisa e vai à Visão geral', async () => {
        serveState(onboardingState({ sample: { active: false, available: true } }));
        const sample = countCalls('post', '*/onboarding/sample', () =>
            HttpResponse.json(closedState({ sample: { active: true, available: true } }))
        );
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        await userEvent.click(await screen.findByRole('button', { name: 'Só explorar com dados de exemplo' }));

        expect(await screen.findByText('Dados de exemplo carregados')).toBeInTheDocument();
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/patrimonio');
        });
        expect(sample.calls()).toBe(1);
        expect(screen.queryByRole('link', { name: 'Continuar configuração' })).not.toBeInTheDocument();
    });

    it('mostra o erro quando o exemplo está indisponível (409)', async () => {
        serveState(onboardingState({ sample: { active: false, available: true } }));
        server.use(
            http.post('*/onboarding/sample', () => HttpResponse.json(problem('onboarding.sample_unavailable', 409), { status: 409 }))
        );
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        await userEvent.click(await screen.findByRole('button', { name: 'Só explorar com dados de exemplo' }));

        expect(await screen.findByText('Os dados de exemplo não estão disponíveis no momento.')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/onboarding');
    });

    it('mostra o erro de falha na carga do exemplo (500)', async () => {
        serveState(onboardingState({ sample: { active: false, available: true } }));
        server.use(http.post('*/onboarding/sample', () => HttpResponse.json(problem('onboarding.sample_failed', 500), { status: 500 })));
        renderRouterAt('/onboarding', { signedIn: true });

        await userEvent.click(await screen.findByRole('button', { name: 'Só explorar com dados de exemplo' }));

        expect(await screen.findByText('Não foi possível carregar os dados de exemplo. Nada foi alterado.')).toBeInTheDocument();
    });
});

describe('pular configuração', () => {
    async function openDialog(): Promise<HTMLElement> {
        await userEvent.click(await screen.findByRole('button', { name: /Pular configuração/ }));
        return screen.findByRole('dialog', { name: 'Pular a configuração?' });
    }

    it('explica a consequência e Continuar configurando fecha sem chamar a API', async () => {
        serveState(onboardingState());
        const dismiss = countCalls('post', '*/onboarding/dismiss', () => HttpResponse.json(closedState()));
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        const dialog: HTMLElement = await openDialog();
        expect(within(dialog).getByText(/as telas vazias mostram o próximo passo/)).toBeInTheDocument();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Continuar configurando' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(dismiss.calls()).toBe(0);
        expect(router.state.location.pathname).toBe('/onboarding');
    });

    it('Pular configuração chama dismiss e vai para /', async () => {
        serveState(onboardingState());
        const dismiss = countCalls('post', '*/onboarding/dismiss', () => HttpResponse.json(closedState()));
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        const dialog: HTMLElement = await openDialog();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Pular configuração' }));

        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
        expect(dismiss.calls()).toBe(1);
        expect(track).toHaveBeenCalledWith('onboarding_dismissed', { at: 'welcome' });
        expect(screen.queryByRole('link', { name: 'Continuar configuração' })).not.toBeInTheDocument();
    });

    it('já estando encerrado (409), recarrega o estado e segue para /', async () => {
        let closed: boolean = false;
        server.use(
            http.get('*/onboarding', () => HttpResponse.json(closed ? closedState() : onboardingState())),
            http.post('*/onboarding/dismiss', () => {
                closed = true;
                return HttpResponse.json(problem('onboarding.already_closed', 409), { status: 409 });
            })
        );
        const router: AnyRouter = renderRouterAt('/onboarding', { signedIn: true });

        const dialog: HTMLElement = await openDialog();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Pular configuração' }));

        expect(await screen.findByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/');
    });

    it('mostra o erro e mantém o diálogo quando o dismiss falha', async () => {
        serveState(onboardingState());
        server.use(http.post('*/onboarding/dismiss', () => HttpResponse.json(problem('core.internal', 500), { status: 500 })));
        renderRouterAt('/onboarding', { signedIn: true });

        const dialog: HTMLElement = await openDialog();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Pular configuração' }));

        expect(await screen.findByText('Não foi possível concluir agora. Tente novamente em instantes.')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('não oferece pular no Pronto', async () => {
        serveState(onboardingState({ status: 'summary' }));
        renderRouterAt('/onboarding/done', { signedIn: true });

        await screen.findByRole('heading', { level: 1 });
        expect(screen.queryByRole('button', { name: /Pular configuração/ })).not.toBeInTheDocument();
    });
});

describe('progresso', () => {
    it('mostra os quatro rótulos, o ativo e a versão compacta nas etapas', async () => {
        serveState(onboardingState({ status: 'assets' }));
        renderRouterAt('/onboarding/assets', { signedIn: true });

        const list: HTMLElement = await screen.findByRole('list', { name: 'Progresso da configuração' });
        expect(
            within(list)
                .getAllByRole('listitem')
                .map((item: HTMLElement): string | null => item.textContent)
        ).toEqual(['Boas-vindas', '2Patrimônio', '3Gastos', '4Pronto']);
        expect(within(list).getByText('Patrimônio').previousSibling).toHaveAttribute('aria-current', 'step');
        const compact: HTMLElement = screen.getByRole('progressbar', { name: 'Progresso da configuração' });
        expect(compact).toHaveAttribute('aria-valuenow', '1');
        expect(within(compact).getByText('Etapa 1 de 2')).toBeInTheDocument();
        expect(screen.getByText('Etapa 1 de 2 · opcional')).toBeInTheDocument();
    });

    it('marca feito com check e o passo atual com número, sem traço quando é o atual', async () => {
        serveState(
            onboardingState({
                status: 'summary',
                steps: {
                    assets: { doneAt: '2026-10-01T12:00:00.000Z', skippedAt: null },
                    banks: { doneAt: null, skippedAt: '2026-10-01T12:00:00.000Z' }
                }
            })
        );
        renderRouterAt('/onboarding/banks', { signedIn: true });

        const list: HTMLElement = await screen.findByRole('list', { name: 'Progresso da configuração' });
        expect(within(list).getAllByRole('listitem')[0]?.querySelector('svg')).not.toBeNull();
        expect(within(list).queryByText('–')).not.toBeInTheDocument();
        const compact: HTMLElement = screen.getByRole('progressbar');
        expect(compact).toHaveAttribute('aria-valuenow', '2');
        expect(within(list).getAllByRole('listitem')[1]?.querySelector('svg')).not.toBeNull();
    });

    it('risca o passo pulado quando se está em outra etapa', async () => {
        serveState(
            onboardingState({
                status: 'assets',
                steps: { assets: { doneAt: null, skippedAt: null }, banks: { doneAt: null, skippedAt: '2026-10-01T12:00:00.000Z' } }
            })
        );
        renderRouterAt('/onboarding/assets', { signedIn: true });

        const list: HTMLElement = await screen.findByRole('list', { name: 'Progresso da configuração' });
        expect(within(list).getByText('–')).toBeInTheDocument();
        expect(within(list).getByText('Gastos')).toHaveClass('line-through');
    });

    it('pular as duas etapas leva de uma à outra até o Pronto', async () => {
        serveState(onboardingState({ status: 'assets' }));
        const router: AnyRouter = renderRouterAt('/onboarding/assets', { signedIn: true });

        await userEvent.click(await screen.findByRole('button', { name: 'Pular por enquanto' }));
        expect(await screen.findByRole('heading', { level: 1, name: 'Conecte seus bancos' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Pular por enquanto' }));

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/onboarding/done');
        });
        expect(screen.queryByRole('list', { name: 'Progresso da configuração' })).not.toBeInTheDocument();
    });
});
