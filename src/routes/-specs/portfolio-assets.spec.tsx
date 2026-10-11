import { track } from '@/shared/lib/analytics';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import { i18n } from '@/shared/lib/i18n';
import { mockHoldingsApi, type HoldingsApi } from '../../../test/helpers/holdings-api';
import { holding, emptyHoldings, sampleHoldings } from '../../../test/fixtures/portfolio';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/portfolio/assets';

async function loaded(symbol: string = 'ITUB4'): Promise<void> {
    await screen.findByLabelText(`Quantidade de ${symbol}`);
}

afterEach(async () => {
    vi.unstubAllGlobals();
    await i18n.changeLanguage('pt-BR');
});

describe('/portfolio/assets: lista', () => {
    it('mostra as 19 linhas, fontes traduzidas e o chip de título', async () => {
        mockHoldingsApi();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        const table: HTMLElement = screen.getByRole('table', { name: 'Seus ativos' });
        expect(within(table).getAllByRole('row')).toHaveLength(20);
        expect(within(table).getAllByText('B3 via brapi').length).toBeGreaterThan(0);
        expect(within(table).getAllByText('Finnhub').length).toBeGreaterThan(0);
        expect(within(table).getAllByText('CoinGecko').length).toBeGreaterThan(0);
        expect(within(table).getAllByText('título').length).toBe(3);
    });

    it('troca a classe de HGLG11 pelo PUT certo e avisa', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('combobox', { name: 'Classe de HGLG11' }));
        await user.click(await screen.findByRole('option', { name: 'Ações Brasil' }));

        expect(await screen.findByText('HGLG11 agora está em Ações Brasil')).toBeInTheDocument();
        expect(api.reclassified).toEqual([{ path: 'position/hglg11', body: { classId: 'class-acoes-br' } }]);
        expect(track).toHaveBeenCalledWith('portfolio_asset_reclassified');
    });

    it('edita a quantidade com Enter e recusa casas decimais demais', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const input: HTMLElement = screen.getByLabelText('Quantidade de ITUB4');

        await user.clear(input);
        await user.type(input, '2500.5{Enter}');
        expect(await screen.findByRole('alert')).toHaveTextContent('Este ativo só aceita quantidades inteiras.');
        expect(api.patched).toEqual([]);
        expect(input).toHaveValue('2000');

        await user.clear(input);
        await user.type(input, '2500{Enter}');
        await waitFor(() => {
            expect(api.patched).toEqual([{ id: 'itub4', body: { quantity: '2500' } }]);
        });
    });

    it('Esc descarta a edição e sair do campo sem mudar não envia nada', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();
        const input: HTMLElement = screen.getByLabelText('Quantidade de ITUB4');

        await user.clear(input);
        await user.type(input, '9{Escape}');
        expect(input).toHaveValue('2000');
        await user.click(input);
        await user.tab();

        expect(api.patched).toEqual([]);
    });

    it('edita o CDB com a prévia e envia o PATCH com rateBps', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Editar CDB Inter' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Editar CDB Inter' });
        expect(await within(dialog).findByText('Imposto estimado')).toBeInTheDocument();
        const rate: HTMLElement = within(dialog).getByLabelText('Percentual do CDI');
        await user.clear(rate);
        await user.type(rate, '112');
        await user.click(within(dialog).getByRole('button', { name: 'Salvar alterações' }));

        await waitFor(() => {
            expect(api.titlePatched).toHaveLength(1);
        });
        expect(api.titlePatched[0]).toMatchObject({ id: 'fi-cdb', body: { rateBps: 11200, name: 'CDB Inter' } });
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).toBeNull();
        });
    });

    it('remove pedindo confirmação que nomeia a consequência', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Remover ITUB4' }));
        const dialog: HTMLElement = await screen.findByRole('dialog', { name: 'Remover ITUB4 da carteira?' });
        expect(dialog).toHaveTextContent('As metas ligadas a ele deixam de existir e o valor sai do patrimônio.');
        expect(api.deleted).toEqual([]);
        await user.click(within(dialog).getByRole('button', { name: 'Remover' }));

        expect(await screen.findByText('ITUB4 removido da carteira')).toBeInTheDocument();
        expect(api.deleted).toEqual(['position/itub4']);
        expect(track).toHaveBeenCalledWith('portfolio_asset_removed');
    });

    it('remove um título de renda fixa pela rota de títulos', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Remover CDB Inter' }));
        await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remover' }));

        await waitFor(() => {
            expect(api.deleted).toEqual(['title/fi-cdb']);
        });
    });
});

describe('/portfolio/assets: planilha', () => {
    it('baixa o .xlsx com o nome do cabeçalho', async () => {
        const api: HoldingsApi = mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        const create: MockInstance = vi.fn(() => 'blob:x');
        vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }));
        const click: MockInstance = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Baixar planilha' }));
        await user.click(await screen.findByRole('menuitem', { name: '.xlsx (Excel)' }));

        expect(await screen.findByText('Planilha baixada')).toBeInTheDocument();
        expect(api.exported).toEqual(['xlsx']);
        expect(track).toHaveBeenCalledWith('portfolio_export_downloaded', { format: 'xlsx' });
        expect(create).toHaveBeenCalledTimes(1);
        expect(click).toHaveBeenCalledTimes(1);
        click.mockRestore();
    });

    it('mostra a mensagem de limite no 429', async () => {
        mockHoldingsApi({ exportStatus: 429 });
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        await user.click(screen.getByRole('button', { name: 'Baixar planilha' }));
        await user.click(await screen.findByRole('menuitem', { name: '.csv (texto)' }));

        expect(await screen.findByText(/baixou muitas planilhas/)).toBeInTheDocument();
    });
});

describe('/portfolio/assets: sinalizações e estados', () => {
    it('sinaliza sem cotação, cotação velha, estimado e vencido', async () => {
        mockHoldingsApi({
            holdings: {
                ...emptyHoldings(),
                data: [
                    holding({ id: 'a', symbol: 'AAA1', missingQuote: true, valueMinor: 0, nativeValueMinor: 0 }),
                    holding({ id: 'b', symbol: 'BBB1', stale: true, priceDate: '2026-10-01' }),
                    holding({
                        id: 'c',
                        symbol: 'CCC1',
                        kind: 'fixed_income',
                        quantity: null,
                        quantityDecimals: null,
                        estimated: true,
                        matured: true
                    }),
                    holding({ id: 'd', symbol: 'DDD1', missingRate: true, nativeCurrency: 'USD', valueMinor: 0 })
                ]
            }
        });
        renderRouterAt(PATH, { signedIn: true });
        await loaded('BBB1');

        expect(screen.getByText('sem cotação ainda')).toBeInTheDocument();
        expect(screen.getByText('cotação de 01/10/2026')).toBeInTheDocument();
        expect(screen.getByText('estimado')).toBeInTheDocument();
        expect(screen.getByText('vencido')).toBeInTheDocument();
        expect(screen.getByText('sem câmbio')).toBeInTheDocument();
        expect(screen.getAllByText('—')).toHaveLength(2);
        expect(screen.queryByText('R$ 0,00')).toBeNull();
    });

    it('mostra a dica com quantidade zero', async () => {
        mockHoldingsApi({ holdings: { ...emptyHoldings(), data: [holding({ quantity: '0' })] } });
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        expect(screen.getByText(/só recebe aporte se tiver meta/)).toBeInTheDocument();
    });

    it('vazio oferece adicionar e o passo a passo', async () => {
        mockHoldingsApi({ holdings: emptyHoldings() });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Você ainda não tem ativos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Adicionar ativo' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Começar pelo passo a passo' })).toHaveAttribute('href', '/portfolio/get-started');
    });

    it('erro 500 mostra o alerta com a retentativa', async () => {
        mockHoldingsApi({ holdingsStatus: 500 });
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar seus ativos.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });

    it('?add=true&classId= abre o modal e fechar limpa a URL', async () => {
        mockHoldingsApi();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(`${PATH}?add=true&classId=class-fii`, { signedIn: true });

        await user.click(await screen.findByRole('button', { name: /Renda fixa/ }));
        expect(await screen.findByRole('combobox', { name: 'Classe' })).toHaveTextContent('FIIs');
        await user.keyboard('{Escape}');

        await waitFor(() => {
            expect(router.state.location.search).toEqual({});
        });
    });

    it('em inglês', async () => {
        mockHoldingsApi();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByLabelText('Quantity of ITUB4')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download spreadsheet' })).toBeInTheDocument();
    });

    it('em 390 px usa a lista de cartões', async () => {
        mockHoldingsApi({ holdings: sampleHoldings() });
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: query.includes('max-width: 639px'),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }));
        renderRouterAt(PATH, { signedIn: true });
        await loaded();

        expect(screen.queryByRole('table')).toBeNull();
        expect(within(screen.getByRole('list', { name: 'Lista dos seus ativos' })).getAllByRole('listitem')).toHaveLength(19);
    });
});
