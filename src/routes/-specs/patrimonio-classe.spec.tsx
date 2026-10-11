import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { AnyRouter } from '@tanstack/react-router';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { classDetail, equalSplitDetail, zeroQuantityDetail } from '../../../test/fixtures/class-detail';
import { mockAssetsApi } from '../../../test/helpers/assets-api';
import { installClassDetailApi, type ClassDetailApi, type ClassDetailApiOptions } from '../../../test/helpers/class-detail-api';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/patrimonio/classes/class-acoes-br';

interface Screen {
    readonly api: ClassDetailApi;
    readonly user: UserEvent;
    readonly router: AnyRouter;
}

async function openScreen(options: ClassDetailApiOptions = {}): Promise<Screen> {
    const api: ClassDetailApi = installClassDetailApi(options);
    const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
    await screen.findByRole('textbox', { name: 'Meta de ITUB4 na classe' });
    return { api, user: userEvent.setup(), router };
}

function field(symbol: string): HTMLElement {
    return screen.getByRole('textbox', { name: `Meta de ${symbol} na classe` });
}

async function typeTarget(user: UserEvent, symbol: string, value: string): Promise<void> {
    await user.clear(field(symbol));
    await user.type(field(symbol), value);
}

function saveButton(): HTMLElement {
    return screen.getByRole('button', { name: 'Salvar metas' });
}

describe('classe: leitura', () => {
    it('mostra cabeçalho, ativos, pesos atuais, metas e soma em 100%', async () => {
        await openScreen();

        expect(screen.getByRole('heading', { name: 'Ações Brasil' })).toBeInTheDocument();
        expect(screen.getByText(/R\$\s220\.170,00 · 12,4% do patrimônio, meta de 15%\. Defina quanto cada ativo/)).toBeInTheDocument();
        const rows: HTMLElement[] = within(screen.getByRole('list', { name: 'Ativos da classe' })).getAllByRole('listitem');
        expect(rows).toHaveLength(3);
        ['34,3%', '35,5%', '30,2%'].forEach((share: string, index: number): void => {
            expect(rows[index]).toHaveTextContent(share);
        });
        expect(['ITUB4', 'WEGE3', 'PETR4'].map((symbol: string): string | null => field(symbol).getAttribute('value'))).toEqual([
            '30',
            '40',
            '30'
        ]);
        expect(screen.getByText('Soma das metas: 100%')).toBeInTheDocument();
        expect(saveButton()).toBeDisabled();
        const header: HTMLElement = screen.getByRole('heading', { name: 'Ações Brasil' }).closest('header') as HTMLElement;
        expect(within(header).getByRole('link', { name: 'Visão geral' })).toHaveAttribute('href', '/patrimonio');
    });

    it('o tooltip do medidor mostra Na classe, Meta e a situação', async () => {
        const { user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Atual vs meta de WEGE3' }));

        const tooltip: HTMLElement = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(/Na classe: 35,5% · R\$\s78\.150,00/);
        expect(tooltip).toHaveTextContent('Meta: 40%');
        expect(tooltip).toHaveTextContent('Dentro da faixa de tolerância');
    });

    it('mostra quanto falta para a meta quando o ativo está fora da faixa', async () => {
        installClassDetailApi({
            detail: classDetail({
                seeds: [
                    { id: 'a', symbol: 'AAA1', name: 'A', valueMinor: 1000000, targetBps: 6000 },
                    { id: 'b', symbol: 'BBB1', name: 'B', valueMinor: 9000000, targetBps: 4000 }
                ]
            })
        });
        renderRouterAt(PATH, { signedIn: true });
        const user: UserEvent = userEvent.setup();

        await user.click(await screen.findByRole('button', { name: 'Atual vs meta de AAA1' }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent(/Faltam R\$\s50\.000,00/);
        expect(screen.getByText('−50,0 pp abaixo')).toBeInTheDocument();
    });

    it('abre em inglês', async () => {
        installClassDetailApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByRole('textbox', { name: 'Target of ITUB4 in the class' })).toBeInTheDocument();
        expect(screen.getByText('Targets sum: 100%')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add asset to the class' })).toBeInTheDocument();
    });
});

describe('classe: edição e salvamento', () => {
    it('WEGE3 em 45 estoura a soma e PETR4 em 25 fecha 100% e envia os bps', async () => {
        const { api, user } = await openScreen();

        await typeTarget(user, 'WEGE3', '45');

        expect(screen.getByText('Soma das metas: 105% (tire 5 pp)')).toBeInTheDocument();
        expect(saveButton()).toBeDisabled();

        await typeTarget(user, 'PETR4', '25');

        expect(screen.getByText('Soma das metas: 100%')).toBeInTheDocument();
        expect(saveButton()).toBeEnabled();

        await user.click(saveButton());

        expect(await screen.findByText('Metas dos ativos salvas')).toBeInTheDocument();
        expect(api.requests[0]).toEqual({
            method: 'PUT',
            path: '/allocation/targets/classes/class-acoes-br/assets',
            body: {
                targets: [
                    { subjectType: 'position', subjectId: 'position-itub4', targetInClassBps: 3000 },
                    { subjectType: 'position', subjectId: 'position-wege3', targetInClassBps: 4500 },
                    { subjectType: 'position', subjectId: 'position-petr4', targetInClassBps: 2500 }
                ]
            }
        });
        await waitFor(() => {
            expect(saveButton()).toBeDisabled();
        });
        expect(field('WEGE3')).toHaveValue('45');
    });

    it('mostra quanto falta quando a soma fica abaixo de 100%', async () => {
        const { user } = await openScreen();

        await typeTarget(user, 'PETR4', '15');

        expect(screen.getByText('Soma das metas: 85% (faltam 15 pp)')).toBeInTheDocument();
    });

    it('Dividir igualmente preenche 33,34 / 33,33 / 33,33', async () => {
        const { user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Dividir igualmente' }));

        await waitFor(() => {
            expect(['ITUB4', 'WEGE3', 'PETR4'].map((symbol: string): string | null => field(symbol).getAttribute('value'))).toEqual([
                '33,34',
                '33,33',
                '33,33'
            ]);
        });
        expect(screen.getByText('Soma das metas: 100%')).toBeInTheDocument();
        expect(saveButton()).toBeEnabled();
    });

    it('Usar divisão igual automática zera tudo, aceita a soma e grava zeros', async () => {
        const { api, user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Usar divisão igual automática' }));

        await waitFor(() => {
            expect(field('ITUB4')).toHaveValue('0');
        });
        expect(screen.getByText('Soma das metas: 0% (divisão igual automática)')).toBeInTheDocument();
        expect(screen.getByText('Divisão igual até você definir as suas')).toBeInTheDocument();
        await user.click(saveButton());

        await waitFor(() => {
            expect(api.requests).toHaveLength(1);
        });
        expect((api.requests[0]?.body as { targets: { targetInClassBps: number }[] }).targets.map((item) => item.targetInClassBps)).toEqual(
            [0, 0, 0]
        );
    });

    it('Descartar alterações volta às metas salvas', async () => {
        const { user } = await openScreen();
        await typeTarget(user, 'WEGE3', '45');

        await user.click(screen.getByRole('button', { name: 'Descartar alterações' }));

        await waitFor(() => {
            expect(field('WEGE3')).toHaveValue('40');
        });
        expect(saveButton()).toBeDisabled();
    });

    it('422 mantém os valores digitados e mostra a mensagem traduzida', async () => {
        const { api, user } = await openScreen({ saveFailure: { type: 'allocation.targets_must_sum_100', status: 422 } });
        await typeTarget(user, 'WEGE3', '45');
        await typeTarget(user, 'PETR4', '25');

        await user.click(saveButton());

        const alert: HTMLElement = await screen.findByText('Não foi possível salvar as metas dos ativos');
        expect(alert.closest('[role="alert"]')).toHaveTextContent('As metas precisam somar exatamente 100%.');
        expect(api.requests).toHaveLength(1);
        expect(field('WEGE3')).toHaveValue('45');
    });
});

describe('classe: divisão igual efetiva, zero e vazio', () => {
    it('metas não definidas mostram a divisão igual com a dica e a primeira gravação envia os valores', async () => {
        const { api, user } = await openScreen({ detail: equalSplitDetail() });

        expect(screen.getByText('Divisão igual até você definir as suas')).toBeInTheDocument();
        expect(field('ITUB4')).toHaveValue('33,34');
        expect(saveButton()).toBeEnabled();

        await user.click(saveButton());

        await waitFor(() => {
            expect(api.requests).toHaveLength(1);
        });
        expect((api.requests[0]?.body as { targets: { targetInClassBps: number }[] }).targets.map((item) => item.targetInClassBps)).toEqual(
            [3334, 3333, 3333]
        );
    });

    it('ativo com quantidade zero e meta aparece com o chip, 0% atual e a nota do aporte', async () => {
        await openScreen({ detail: zeroQuantityDetail() });

        const row: HTMLElement = screen.getByText('VALE3').closest('li') as HTMLElement;
        expect(within(row).getByText('quantidade 0')).toBeInTheDocument();
        expect(row).toHaveTextContent('0,0%');
        expect(field('VALE3')).toHaveValue('20');
        expect(screen.getByText(/Quer incluir um ativo que ainda não tem\?/)).toBeInTheDocument();
    });

    it('ativo sem cotação mostra traço e o chip de atenção', async () => {
        installClassDetailApi({
            detail: classDetail({
                seeds: [{ id: 'x', symbol: 'SEMCOT', name: 'Sem cotação', valueMinor: 0, targetBps: 10000, missingQuote: true }]
            })
        });
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByRole('textbox', { name: 'Meta de SEMCOT na classe' });

        const row: HTMLElement = screen.getByText('SEMCOT').closest('li') as HTMLElement;
        expect(within(row).getByText('sem cotação')).toBeInTheDocument();
        expect(within(row).getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });

    it('avisa quando as metas gravadas não somam 100%', async () => {
        await openScreen({ detail: classDetail({ targetsSumBps: 9000 }) });

        expect(screen.getByText('As metas desta classe não somam 100%. Ajuste e salve.')).toBeInTheDocument();
    });

    it('classe vazia mostra o estado vazio com a ação e a nota', async () => {
        installClassDetailApi({ detail: classDetail({ seeds: [] }) });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Nenhum ativo nesta classe ainda.')).toBeInTheDocument();
        expect(screen.getByText(/Adicione com quantidade zero/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Adicionar ativo' })).toBeInTheDocument();
    });

    it('classe inexistente mostra Classe não encontrada com o caminho de volta', async () => {
        installClassDetailApi({ missingClass: true });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Classe não encontrada')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Voltar para a visão geral' })).toHaveAttribute('href', '/patrimonio');
    });

    it('erro de carregamento oferece tentar de novo', async () => {
        server.use(
            http.get('*/portfolio/classes/:classId', () =>
                HttpResponse.json({ title: 'x', detail: 'falhou', status: 500 }, { status: 500 })
            )
        );
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a classe.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });
});

describe('classe: adicionar ativo e navegação', () => {
    it('Adicionar ativo à classe abre o modal com a classe pré-selecionada', async () => {
        mockAssetsApi();
        const { user } = await openScreen();

        await user.click(screen.getByRole('button', { name: 'Adicionar ativo à classe' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'O que você quer adicionar?' });
        await user.click(within(dialog).getByRole('button', { name: /Renda fixa/ }));

        expect(await screen.findByRole('combobox', { name: 'Classe' })).toHaveTextContent('Ações Brasil');
    });

    it('bloqueia a navegação com edição pendente e descarta ao confirmar', async () => {
        const { user, router } = await openScreen();
        await typeTarget(user, 'WEGE3', '45');

        void router.navigate({ to: '/patrimonio/aporte' });
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Metas não salvas' });
        expect(router.state.location.pathname).toBe(PATH);

        await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
        expect(field('WEGE3')).toHaveValue('45');

        void router.navigate({ to: '/patrimonio/aporte' });
        await user.click(
            within(await screen.findByRole('dialog', { name: 'Metas não salvas' })).getByRole('button', { name: 'Sair e descartar' })
        );
        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/patrimonio/aporte');
        });
    });
});
