import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { track } from '@/shared/lib/analytics';
import { i18n } from '@/shared/lib/i18n';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { NUBANK_LOGO_URL, accountId, canonicalTransactions, emptyAccounts, transactionView } from '../../../../../test/fixtures/spending';
import { mockTransactionsApi, type TransactionsApi } from '../../../../../test/helpers/transactions-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';
import type { TransactionView, TransactionsResponse } from '../../types';

const PATH: string = '/spending/transactions?month=2026-09';

async function loaded(): Promise<void> {
    await screen.findByText('IFOOD *RESTAURANTE SABOR');
}

function rowOf(text: string): HTMLElement {
    const row: HTMLElement | null = screen.getByText(text).closest('tr');
    if (row === null) {
        throw new Error(`linha de ${text} não encontrada`);
    }
    return row;
}

function narrow(): void {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: query.includes('max-width: 639px'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }));
}

function manyTransactions(count: number): TransactionsResponse {
    const data: TransactionView[] = Array.from({ length: count }, (_unused: unknown, index: number): TransactionView =>
        transactionView({
            id: `tx-${String(index)}`,
            description: `COMPRA ${String(index)}`,
            categoryId: 'cat-groceries',
            categorySource: 'dictionary'
        })
    );
    return { data, pagination: { page: 1, pageSize: 50, totalRecords: count, totalPages: 1 }, totals: { inMinor: 0, outMinor: 0, count } };
}

afterEach(async () => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    await i18n.changeLanguage('pt-BR');
});

describe('/spending/transactions: lista', () => {
    it('resolve a logo do banco pela conta da transação e cai nas iniciais sem logo', async () => {
        mockTransactionsApi();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        const ifood: HTMLElement = rowOf('IFOOD *RESTAURANTE SABOR');
        await waitFor(() => {
            expect(within(ifood).getByRole('img', { name: 'Logo de Nubank' })).toHaveAttribute('src', NUBANK_LOGO_URL);
        });
        expect(within(rowOf('SALARIO EMPRESA X')).queryByRole('img')).not.toBeInTheDocument();
    });

    it('mostra tile, categoria e origem de cada transação', async () => {
        mockTransactionsApi();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        const ifood: HTMLElement = rowOf('IFOOD *RESTAURANTE SABOR');
        expect(within(ifood).getByText('Delivery e restaurantes')).toBeInTheDocument();
        expect(within(ifood).getByText('por dicionário')).toBeInTheDocument();
        expect(within(ifood).getByText('Nubank Cartão')).toBeInTheDocument();
        expect(within(ifood).getByText(/89,90/)).toBeInTheDocument();
        const market: HTMLElement = rowOf('SUPERMERCADO BOM PRECO');
        expect(within(market).getByText('Mercado')).toBeInTheDocument();
        expect(within(market).getByText('pela Pluggy')).toBeInTheDocument();
        expect(within(rowOf('SALARIO EMPRESA X')).getByText(/28\.000,00/)).toBeInTheDocument();
    });

    it('mostra parcela e selo de exemplo e junta o favorecido à descrição', async () => {
        const base: TransactionsResponse = manyTransactions(1);
        mockTransactionsApi({
            transactions: {
                ...base,
                data: [
                    transactionView({
                        id: 'tx-a',
                        description: 'Pix enviado',
                        counterpartyName: 'Joao Lima',
                        categoryId: 'cat-leisure',
                        categorySource: 'user',
                        installment: { number: 3, total: 10 },
                        isSample: true
                    })
                ]
            }
        });
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByText('Pix enviado · Joao Lima');

        const row: HTMLElement = rowOf('Pix enviado · Joao Lima');
        expect(within(row).getByText('3/10')).toBeInTheDocument();
        expect(within(row).getByText('exemplo')).toBeInTheDocument();
        expect(within(row).getByText('você corrigiu')).toBeInTheDocument();
    });

    it('o rodapé traz os totais do filtro', async () => {
        mockTransactionsApi();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        const totals: HTMLElement = screen.getByLabelText('Totais do filtro');
        expect(totals).toHaveTextContent(/Entradas\+R\$\s*38\.000,00/);
        expect(totals).toHaveTextContent(/Saídas−R\$/);
        expect(totals).toHaveTextContent(`${String(canonicalTransactions().data.length)} transações`);
    });

    it('usa o mês corrente quando a URL não traz mês', async () => {
        vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 11) });
        const api: TransactionsApi = mockTransactionsApi();
        renderRouterAt('/spending/transactions', { signedIn: true });
        await loaded();

        expect(api.lists[0]?.get('month')).toBe('2026-10');
        expect(api.lists[0]?.get('pageSize')).toBe('50');
        expect(screen.getByText('mês em andamento')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled();
    });

    it('lê os filtros da URL e manda para a requisição', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        renderRouterAt(`${PATH}&accountId=${accountId('itau-checking')}&direction=out&q=pix`, { signedIn: true });

        await waitFor(() => {
            expect(api.lists).toHaveLength(1);
        });
        expect(Object.fromEntries(api.lists[0] ?? [])).toEqual({
            month: '2026-09',
            accountId: accountId('itau-checking'),
            direction: 'out',
            q: 'pix',
            page: '1',
            pageSize: '50'
        });
    });

    it('as ações levam a Regras e abrem a importação pela URL', async () => {
        mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(`${PATH}&direction=out`, { signedIn: true });
        await loaded();

        expect(screen.getByRole('link', { name: 'Gerenciar regras' })).toHaveAttribute('href', '/spending/rules');
        await user.click(screen.getByRole('link', { name: 'Importar extrato' }));

        await waitFor(() => {
            expect(router.state.location.search).toMatchObject({ import: true, direction: 'out', month: '2026-09' });
        });
    });
});

describe('/spending/transactions: filtros', () => {
    it('o botão do aviso aplica "só sem categoria"', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(await screen.findByRole('button', { name: 'Ver só as sem categoria' }));

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ month: '2026-09', uncategorized: true });
        });
        await waitFor(() => {
            expect(screen.queryByText('IFOOD *RESTAURANTE SABOR')).toBeNull();
        });
        expect(api.lists.at(-1)?.get('uncategorized')).toBe('true');
        expect(screen.getAllByText('Pix enviado · Maria Souza')).toHaveLength(2);
    });

    it('mês, conta, categoria e direção vão para a URL e para a API, e voltam à página 1', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(`${PATH}&page=2`, { signedIn: true });
        await screen.findByRole('group', { name: 'Mês' });

        await user.click(screen.getByRole('button', { name: 'Mês anterior' }));
        await waitFor(() => {
            expect(router.state.location.search).toEqual({ month: '2026-08' });
        });
        await user.click(screen.getByRole('combobox', { name: 'Conta' }));
        await user.click(await screen.findByRole('option', { name: 'Itaú Conta' }));
        await user.click(screen.getByRole('radio', { name: 'Saídas' }));
        await user.click(screen.getByRole('button', { name: 'Categoria: Todas as categorias' }));
        await user.click(await screen.findByRole('option', { name: /Mercado/ }));

        await waitFor(() => {
            expect(router.state.location.search).toEqual({
                month: '2026-08',
                accountId: accountId('itau-checking'),
                direction: 'out',
                categoryId: 'cat-groceries'
            });
        });
        await waitFor(() => {
            expect(Object.fromEntries(api.lists.at(-1) ?? [])).toMatchObject({
                month: '2026-08',
                accountId: accountId('itau-checking'),
                direction: 'out',
                categoryId: 'cat-groceries',
                page: '1'
            });
        });
    });

    it('"Sem categoria" no seletor vira uncategorized=true', async () => {
        const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
        mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        await screen.findByRole('group', { name: 'Mês' });

        await user.click(screen.getByRole('button', { name: 'Categoria: Todas as categorias' }));
        await user.click(await screen.findByRole('option', { name: 'Sem categoria' }));

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ month: '2026-09', uncategorized: true });
        });
        expect(screen.getByRole('button', { name: 'Categoria: Sem categoria' })).toBeInTheDocument();
    });

    it('a busca espera 300 ms e dispara uma chamada só', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const before: number = api.lists.length;

        await user.type(screen.getByRole('searchbox', { name: 'Buscar por descrição ou favorecido' }), 'pix');

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ month: '2026-09', q: 'pix' });
        });
        await waitFor(() => {
            expect(screen.queryByText('IFOOD *RESTAURANTE SABOR')).toBeNull();
        });
        expect(api.lists.slice(before).map((query: URLSearchParams): string | null => query.get('q'))).toEqual(['pix']);
    });

    it('"Limpar filtros" tira tudo menos o mês e esvazia a busca', async () => {
        mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(`${PATH}&direction=out&q=pix`, { signedIn: true });
        await screen.findByRole('group', { name: 'Mês' });

        await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ month: '2026-09' });
        });
        expect(screen.getByRole('searchbox', { name: 'Buscar por descrição ou favorecido' })).toHaveValue('');
        expect(screen.queryByRole('button', { name: 'Limpar filtros' })).toBeNull();
        await loaded();
    });
});

describe('/spending/transactions: planilha', () => {
    function stubDownload(): { names: string[]; click: MockInstance } {
        const names: string[] = [];
        vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() }));
        const click: MockInstance = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement
        ): void {
            names.push(this.download);
        });
        return { names, click };
    }

    it('baixa com os mesmos filtros, sem page, e usa o nome do cabeçalho', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const { names, click } = stubDownload();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(`${PATH}&direction=out&q=pix&page=1`, { signedIn: true });
        await screen.findByRole('group', { name: 'Mês' });

        await user.click(screen.getByRole('button', { name: 'Baixar planilha' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Planilha (.xlsx)' }));

        expect(await screen.findByText('Planilha baixada')).toBeInTheDocument();
        expect(Object.fromEntries(api.exports[0] ?? [])).toEqual({ format: 'xlsx', month: '2026-09', direction: 'out', q: 'pix' });
        expect(names).toEqual(['vera-transacoes-2026-10-11.xlsx']);
        expect(track).toHaveBeenCalledWith('spending_export_downloaded', { format: 'xlsx' });
        click.mockRestore();
    });

    it('o csv sai com o formato certo', async () => {
        const api: TransactionsApi = mockTransactionsApi();
        const { click } = stubDownload();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByRole('group', { name: 'Mês' });

        await user.click(screen.getByRole('button', { name: 'Baixar planilha' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Texto (.csv)' }));

        await waitFor(() => {
            expect(api.exports[0]?.get('format')).toBe('csv');
        });
        click.mockRestore();
    });

    it('o 422 de excesso de linhas vira a mensagem para escolher um período menor', async () => {
        mockTransactionsApi({ exportFailure: { type: 'transactions.export_too_large', status: 422 } });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await screen.findByRole('group', { name: 'Mês' });

        await user.click(screen.getByRole('button', { name: 'Baixar planilha' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Planilha (.xlsx)' }));

        expect(await screen.findByText('Muitas transações para um arquivo só. Escolha um período menor.')).toBeInTheDocument();
        expect(track).not.toHaveBeenCalledWith('spending_export_downloaded', expect.anything());
    });
});

describe('/spending/transactions: estados', () => {
    it('sem nenhuma transação na empresa mostra o estado vazio dos gastos', async () => {
        mockTransactionsApi({ accounts: emptyAccounts() });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Nenhum gasto por aqui ainda')).toBeInTheDocument();
        expect(screen.queryByRole('table')).toBeNull();
    });

    it('filtro sem resultado mostra outro vazio, com o botão de limpar', async () => {
        mockTransactionsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(`${PATH}&q=zzzz`, { signedIn: true });

        expect(await screen.findByText('Nenhuma transação com esses filtros')).toBeInTheDocument();
        expect(screen.queryByText('Nenhum gasto por aqui ainda')).toBeNull();
        await user.click(
            within(screen.getByRole('heading', { name: 'Nenhuma transação com esses filtros' }).parentElement as HTMLElement).getByRole(
                'button',
                { name: 'Limpar filtros' }
            )
        );

        await waitFor(() => {
            expect(router.state.location.search).toEqual({ month: '2026-09' });
        });
        await loaded();
    });

    it('mês sem transações e sem filtro explica que o mês está vazio', async () => {
        mockTransactionsApi({ transactions: { ...manyTransactions(0), data: [] } });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Nenhuma transação neste mês')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Limpar filtros' })).toBeNull();
    });

    it('pagina de 50 em 50', async () => {
        const api: TransactionsApi = mockTransactionsApi({ transactions: manyTransactions(120) });
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });
        await screen.findByText('COMPRA 0');
        expect(screen.getAllByRole('row')).toHaveLength(51);
        expect(screen.getByText('1 / 3')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Próxima' }));

        expect(await screen.findByText('COMPRA 50')).toBeInTheDocument();
        expect(router.state.location.search).toEqual({ month: '2026-09', page: 2 });
        expect(api.lists.at(-1)?.get('page')).toBe('2');
    });

    it('erro na lista mostra o alerta e tenta de novo', async () => {
        server.use(
            http.get('*/spending/accounts', () => HttpResponse.json({ accounts: [] })),
            http.get('*/spending/transactions', () =>
                HttpResponse.json({ type: 'core.internal', title: 'x', status: 500, detail: 'x', requestId: null }, { status: 500 })
            )
        );
        mockTransactionsApi({ listFailureStatus: 500 });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar as transações')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    });
});

describe('/spending/transactions: idioma e 390 px', () => {
    it('em inglês', async () => {
        mockTransactionsApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByRole('heading', { name: 'Transactions', level: 2 })).toBeInTheDocument();
        expect(await screen.findByText('2 transactions without a category')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download spreadsheet' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Manage rules' })).toBeInTheDocument();
        expect((await screen.findAllByText('by dictionary')).length).toBeGreaterThan(0);
    });

    it('em 390 px mostra cartões e os filtros secundários num painel', async () => {
        mockTransactionsApi();
        narrow();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        expect(screen.queryByRole('table')).toBeNull();
        expect(within(screen.getByRole('list', { name: 'Lista de transações' })).getAllByRole('listitem')).toHaveLength(
            canonicalTransactions().data.length
        );
        const toggle: HTMLElement = screen.getByRole('button', { name: 'Filtros' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await user.click(screen.getByRole('radio', { name: 'Entradas' }));

        expect(await screen.findByRole('button', { name: 'Filtros (1)' })).toBeInTheDocument();
    });
});

describe('dados canônicos', () => {
    it('o conjunto tem as duas transações sem categoria', () => {
        expect(canonicalTransactions().data.filter((item: TransactionView): boolean => item.categoryId === null)).toHaveLength(2);
    });
});
