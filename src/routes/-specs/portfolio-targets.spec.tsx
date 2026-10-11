import { track } from '@/shared/lib/analytics';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { emptyPortfolioOverview, installTargetsApi, type TargetsApi } from '../../../test/helpers/targets-api';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/portfolio/targets';
const TARGETS: readonly string[] = ['20', '8', '12', '15', '7', '25', '8', '5'];
const TODAY: readonly string[] = ['20,8%', '11,6%', '7,3%', '12,4%', '6,6%', '20,9%', '8,7%', '11,7%'];

async function openScreen(): Promise<{ api: TargetsApi; user: UserEvent; router: AnyRouter }> {
    const api: TargetsApi = installTargetsApi();
    const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
    await screen.findByRole('textbox', { name: 'Meta de Cripto' });
    return { api, user: userEvent.setup(), router };
}

function saveButton(): HTMLElement {
    return screen.getByRole('button', { name: 'Salvar metas' });
}

describe('carteira-alvo: leitura', () => {
    it('mostra as 8 classes com as metas, a coluna Hoje e o total em 100%', async () => {
        await openScreen();

        const rows: HTMLElement[] = within(screen.getByRole('list', { name: 'Metas por classe' })).getAllByRole('listitem');
        expect(rows).toHaveLength(8);
        expect(rows.map((row: HTMLElement): string => within(row).getByRole('textbox').getAttribute('value') ?? '')).toEqual(TARGETS);
        TODAY.forEach((value: string, index: number): void => {
            expect(rows[index]).toHaveTextContent(value);
        });
        expect(screen.getByText('Total: 100%')).toBeInTheDocument();
        expect(saveButton()).toBeDisabled();
    });

    it('cada classe leva aos ativos da classe', async () => {
        await openScreen();

        expect(screen.getByRole('link', { name: 'Ver os ativos de Cripto' })).toHaveAttribute('href', '/portfolio/classes/class-cripto');
    });

    it('carteira sem ativos mantém as metas editáveis e mostra a dica', async () => {
        installTargetsApi({ overview: emptyPortfolioOverview() });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Cadastre seus ativos para comparar.')).toBeInTheDocument();
        expect(screen.getAllByText('—')).toHaveLength(8);
        expect(screen.getByRole('textbox', { name: 'Meta de Cripto' })).toBeEnabled();
    });

    it('mostra o erro de carregamento e tenta de novo', async () => {
        installTargetsApi();
        server.use(
            http.get('*/allocation/classes', () => HttpResponse.json({ title: 'x', detail: 'falhou', status: 500 }, { status: 500 }))
        );
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a carteira-alvo.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });

    it('abre em inglês com os nomes padrão da API', async () => {
        installTargetsApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByRole('textbox', { name: 'Target for Brazilian REITs (FIIs)' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Target for US REITs' })).toBeInTheDocument();
        expect(screen.getByText('Save targets')).toBeInTheDocument();
    });
});

describe('carteira-alvo: edição e salvamento', () => {
    it('+ em Cripto estoura o total e − em REITs fecha 100%', async () => {
        const { user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Aumentar Cripto' }));

        expect(screen.getByRole('textbox', { name: 'Meta de Cripto' })).toHaveValue('6');
        expect(screen.getByText('Total: 101% (tire 1 pp)')).toBeInTheDocument();
        expect(saveButton()).toBeDisabled();

        await user.click(screen.getByRole('button', { name: 'Diminuir REITs' }));

        expect(screen.getByText('Total: 100%')).toBeInTheDocument();
        expect(saveButton()).toBeEnabled();
    });

    it('mostra quanto falta quando a soma fica abaixo de 100%', async () => {
        const { user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Diminuir Cripto' }));
        await user.click(screen.getByRole('button', { name: 'Diminuir Cripto' }));

        expect(screen.getByText('Total: 98% (faltam 2 pp)')).toBeInTheDocument();
    });

    it('envia as metas em bps inteiros, inclusive o que foi digitado com duas casas', async () => {
        const { api, user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Aumentar Cripto' }));
        const usStocks: HTMLElement = screen.getByRole('textbox', { name: 'Meta de Ações EUA' });
        await user.clear(usStocks);
        await user.type(usStocks, '24,00');
        await user.click(saveButton());

        expect(await screen.findByText('Metas salvas')).toBeInTheDocument();
        const body: { targets: { classId: string; targetBps: number }[] } = api.requests[0]?.body as {
            targets: { classId: string; targetBps: number }[];
        };
        expect(api.requests[0]).toMatchObject({ method: 'PUT', path: '/allocation/targets/classes' });
        expect(body.targets.map((item: { targetBps: number }): number => item.targetBps)).toEqual([
            2000, 800, 1200, 1500, 700, 2400, 800, 600
        ]);
        await waitFor(() => {
            expect(saveButton()).toBeDisabled();
        });
        expect(screen.getByRole('textbox', { name: 'Meta de Ações EUA' })).toHaveValue('24');
        expect(track).toHaveBeenCalledWith('portfolio_targets_saved');
    });

    it('422 mantém os valores digitados e mostra a soma recebida', async () => {
        const api: TargetsApi = installTargetsApi({
            saveFailure: { type: 'allocation.targets_must_sum_100', status: 422, meta: { sumBps: 10100 } }
        });
        renderRouterAt(PATH, { signedIn: true });
        const user: UserEvent = userEvent.setup();
        await user.click(await screen.findByRole('button', { name: 'Aumentar Cripto' }));
        await user.click(screen.getByRole('button', { name: 'Diminuir REITs' }));
        await user.click(saveButton());

        const alert: HTMLElement = await screen.findByText('Não foi possível salvar as metas');
        expect(alert.closest('[role="alert"]')).toHaveTextContent('As metas precisam somar exatamente 100%. A soma recebida foi 101%.');
        expect(screen.getByRole('textbox', { name: 'Meta de Cripto' })).toHaveValue('6');
        expect(api.requests).toHaveLength(1);
    });

    it('descartar alterações restaura os valores salvos', async () => {
        const { user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Aumentar Cripto' }));
        await user.click(screen.getByRole('button', { name: 'Descartar alterações' }));

        expect(screen.getByRole('textbox', { name: 'Meta de Cripto' })).toHaveValue('5');
        expect(screen.getByText('Total: 100%')).toBeInTheDocument();
    });

    it('um valor inválido bloqueia o salvamento e mostra o erro da linha', async () => {
        const { user } = await openScreen();

        const crypto: HTMLElement = screen.getByRole('textbox', { name: 'Meta de Cripto' });
        await user.clear(crypto);
        await user.type(crypto, 'abc');

        expect(await screen.findByText('Informe um valor entre 0% e 100%.')).toBeInTheDocument();
        expect(saveButton()).toBeDisabled();
    });
});

describe('carteira-alvo: alterações não salvas', () => {
    it('bloqueia a navegação, mantém a edição ao cancelar e descarta ao confirmar', async () => {
        const { user, router } = await openScreen();
        await user.click(screen.getByRole('button', { name: 'Aumentar Cripto' }));

        void router.navigate({ to: '/portfolio/contribution' });
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Metas não salvas' });
        expect(dialog).toHaveTextContent('Você tem metas não salvas. Sair e descartar?');
        expect(router.state.location.pathname).toBe(PATH);

        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
        expect(screen.getByRole('textbox', { name: 'Meta de Cripto' })).toHaveValue('6');

        void router.navigate({ to: '/portfolio/contribution' });
        await user.click(
            within(await screen.findByRole('dialog', { name: 'Metas não salvas' })).getByRole('button', { name: 'Sair e descartar' })
        );
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/portfolio/contribution');
        });
    });

    it('sem alteração navega sem perguntar', async () => {
        const { router } = await openScreen();

        void router.navigate({ to: '/portfolio/contribution' });

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/portfolio/contribution');
        });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});

describe('carteira-alvo: meta moderada', () => {
    it('só chama o reset depois da confirmação que lista o efeito', async () => {
        const { api, user } = await openScreen();
        await user.click(screen.getByRole('button', { name: 'Aumentar Cripto' }));

        await user.click(screen.getByRole('button', { name: 'Restaurar meta moderada' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Restaurar a meta moderada?' });
        expect(dialog).toHaveTextContent(
            'Renda fixa pós 20%, pré 8%, IPCA+ 12%, Ações Brasil 15%, FIIs 7%, Ações EUA 25%, REITs 8% e Cripto 5%'
        );
        expect(dialog).toHaveTextContent('Suas metas por ativo não mudam.');
        expect(api.requests).toHaveLength(0);

        await user.click(within(dialog).getByRole('button', { name: 'Restaurar meta' }));

        expect(await screen.findByText('Meta moderada restaurada')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'POST', path: '/allocation/targets/reset', body: null }]);
        expect(track).toHaveBeenCalledWith('portfolio_targets_reset');
        expect(screen.getByRole('textbox', { name: 'Meta de Cripto' })).toHaveValue('5');
        expect(saveButton()).toBeDisabled();
    });

    it('cancelar a confirmação não chama a API', async () => {
        const { api, user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Restaurar meta moderada' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(api.requests).toHaveLength(0);
    });

    it('avisa quando o reset falha', async () => {
        const { user } = await openScreen();
        server.use(http.post('*/allocation/targets/reset', () => HttpResponse.error()));

        await user.click(screen.getByRole('button', { name: 'Restaurar meta moderada' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Restaurar meta' }));

        expect(await screen.findByText('Não foi possível restaurar a meta')).toBeInTheDocument();
    });
});

describe('carteira-alvo: faixa de tolerância', () => {
    it('grava 800 ao digitar 8 e sair do campo, e o exemplo acompanha', async () => {
        const { api, user } = await openScreen();

        const input: HTMLElement = screen.getByRole('textbox', { name: 'Tolerância em pontos percentuais' });
        expect(screen.getByText(/entre 15% e 25%/)).toBeInTheDocument();
        await user.clear(input);
        await user.type(input, '8');
        expect(screen.getByText(/entre 12% e 28%/)).toBeInTheDocument();
        await user.tab();

        expect(await screen.findByText('Tolerância de 8 pp salva')).toBeInTheDocument();
        expect(api.requests).toEqual([{ method: 'PUT', path: '/allocation/settings', body: { toleranceBps: 800 } }]);
        expect(track).toHaveBeenCalledWith('portfolio_tolerance_changed');
    });

    it('o passo grava de meio em meio ponto', async () => {
        const { api, user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Aumentar tolerância' }));

        expect(await screen.findByText('Tolerância de 5,5 pp salva')).toBeInTheDocument();
        expect(api.requests[0]?.body).toEqual({ toleranceBps: 550 });
    });

    it('21 é inválido e não grava', async () => {
        const { api, user } = await openScreen();

        const input: HTMLElement = screen.getByRole('textbox', { name: 'Tolerância em pontos percentuais' });
        await user.clear(input);
        await user.type(input, '21');
        await user.tab();

        expect(await screen.findByText('Use um valor entre 0 e 20 pp.')).toBeInTheDocument();
        expect(api.requests).toHaveLength(0);
    });

    it('erro de rede mostra o aviso e volta ao valor salvo', async () => {
        const { user } = await openScreen();
        server.use(http.put('*/allocation/settings', () => HttpResponse.error()));

        const input: HTMLElement = screen.getByRole('textbox', { name: 'Tolerância em pontos percentuais' });
        await user.clear(input);
        await user.type(input, '8');
        await user.tab();

        expect(await screen.findByText('Não foi possível salvar a tolerância')).toBeInTheDocument();
        await waitFor(() => {
            expect(input).toHaveValue('5');
        });
    });
});

describe('carteira-alvo: classes editáveis', () => {
    it('Gerenciar classes abre o diálogo e fechar recarrega as classes', async () => {
        const { user } = await openScreen();
        server.use(
            http.get('*/portfolio/holdings', () => HttpResponse.json({ baseCurrency: 'BRL', asOf: '2026-10-09T12:00:00.000Z', data: [] }))
        );

        await user.click(screen.getByRole('button', { name: 'Gerenciar classes' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Gerenciar classes' });
        await user.click(within(dialog).getAllByRole('button', { name: 'Fechar' }).at(-1) as HTMLElement);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});
