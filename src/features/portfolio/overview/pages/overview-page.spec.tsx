import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { sessionIdentity } from '../../../../../test/fixtures/auth';
import { allWithinOverview, emptyOverview, overviewWithQuality, sampleOverview } from '../../../../../test/fixtures/portfolio';
import { installOverviewApi, type OverviewApi } from '../../../../../test/helpers/overview-api';
import { server } from '../../../../../test/msw/server';
import { renderRouterAt } from '../../../../../test/router';

async function openOverview(): Promise<UserEvent> {
    renderRouterAt('/patrimonio', { signedIn: true });
    await screen.findByText('R$ 1.773.100,40');
    return userEvent.setup();
}

async function openTooltip(): Promise<HTMLElement> {
    const tips: HTMLElement[] = await screen.findAllByRole('tooltip');
    return tips.find((tip: HTMLElement): boolean => tip.querySelector('span') !== null) as HTMLElement;
}

describe('visão geral: conteúdo', () => {
    it('mostra o total, a exposição ao dólar, as classes fora da faixa e a cotação', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.getByRole('heading', { name: 'Seu patrimônio' })).toBeInTheDocument();
        expect(screen.getByText('Exposição ao dólar')).toHaveTextContent(/Exposição ao dólar\s*47,4%/);
        expect(screen.getByText('Fora da faixa')).toHaveTextContent(/Fora da faixa\s*1 de 8/);
        const rate: HTMLElement = screen.getByText('US$ 1 = R$ 5,42');
        expect(rate).toHaveAttribute('title', 'Cotação PTAX de 09/10/2026');
    });

    it('destaca o maior desvio com o atalho para o aporte', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.getByText('Maior desvio: Cripto, 6,7 pp acima da meta.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Onde aportar' })).toHaveAttribute('href', '/patrimonio/aporte');
    });

    it('sem desvio fora da faixa não mostra o destaque', async () => {
        installOverviewApi({ overview: allWithinOverview() });
        await openOverview();

        expect(screen.queryByText(/Maior desvio/)).not.toBeInTheDocument();
        expect(screen.getByText('Fora da faixa')).toHaveTextContent(/Fora da faixa\s*0 de 8/);
    });

    it('sem cotação do dólar a pílula some', async () => {
        installOverviewApi({ overview: { ...sampleOverview(), usdRate: null } });
        await openOverview();

        expect(screen.queryByText(/US\$ 1 =/)).not.toBeInTheDocument();
    });

    it('a tabela marca só Cripto fora da faixa e as outras sete na faixa', async () => {
        installOverviewApi();
        await openOverview();

        const table: HTMLElement = screen.getByRole('table', { name: 'Distribuição por classe' });
        const rows: HTMLElement[] = within(table).getAllByRole('row').slice(1);
        expect(rows).toHaveLength(8);
        expect(within(table).getAllByText('+6,7 pp acima')).toHaveLength(1);
        expect(within(table).getAllByText('na faixa')).toHaveLength(7);
        expect(rows[2]).toHaveTextContent('Renda fixa IPCA+');
        expect(rows[2]).toHaveTextContent('na faixa');
        expect(rows[7]).toHaveTextContent('+6,7 pp acima');
    });

    it('mostra a tolerância e a lista de cartões da versão estreita', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.getByText(/Faixa de tolerância: ±5 pp/)).toBeInTheDocument();
        const list: HTMLElement = screen.getByRole('list', { name: 'Classes da carteira' });
        const cards: HTMLElement[] = within(list).getAllByRole('listitem');
        expect(cards).toHaveLength(8);
        expect(cards[5]).toHaveTextContent('Ações EUA');
        expect(cards[5]).toHaveTextContent('20,9% → meta 25%');
        expect(list.parentElement).toHaveClass('sm:hidden');
        expect(screen.getByRole('table').closest('.hidden')).toHaveClass('sm:block');
    });

    it('mostra a atribuição de fontes de dados', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.getByRole('link', { name: 'Dados fornecidos pela CoinGecko' })).toHaveAttribute('href', 'https://www.coingecko.com/');
    });
});

describe('visão geral: barras e tooltips', () => {
    it('cada segmento é um botão com os valores no rótulo', async () => {
        installOverviewApi();
        await openOverview();

        expect(screen.getAllByRole('button', { name: /^Ações EUA: atual 20,9%, meta 25%$/ })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /^Cripto: atual 11,7%, meta 5%$/ })).toHaveLength(2);
    });

    it('passar o mouse em Ações EUA mostra atual, meta, desvio e situação', async () => {
        installOverviewApi();
        const user: UserEvent = await openOverview();

        await user.hover(screen.getAllByRole('button', { name: /^Ações EUA:/ })[0] as HTMLElement);

        const tip: HTMLElement = await openTooltip();
        expect(within(tip).getByText('Atual: 20,9% · R$ 370.819,60')).toBeInTheDocument();
        expect(within(tip).getByText('Meta: 25% · R$ 443.275,10')).toBeInTheDocument();
        expect(within(tip).getByText('Desvio: −4,1 pp')).toBeInTheDocument();
        expect(within(tip).getByText('Na faixa de tolerância')).toBeInTheDocument();
    });

    it('focar o segmento de Cripto mostra o desvio e quanto passou da meta', async () => {
        installOverviewApi();
        const user: UserEvent = await openOverview();

        await user.tab();
        await user.hover(screen.getAllByRole('button', { name: /^Cripto:/ })[0] as HTMLElement);

        const tip: HTMLElement = await openTooltip();
        expect(within(tip).getByText('Desvio: +6,7 pp')).toBeInTheDocument();
        expect(within(tip).getByText('R$ 118.930,98 acima da meta')).toBeInTheDocument();
    });

    it('na linha Meta o tooltip traz a meta primeiro', async () => {
        installOverviewApi();
        const user: UserEvent = await openOverview();

        await user.hover(screen.getAllByRole('button', { name: /^Cripto:/ })[1] as HTMLElement);

        const lines: string[] = Array.from((await openTooltip()).querySelectorAll('div > span')).map(
            (line: Element): string => line.textContent ?? ''
        );
        expect(lines.findIndex((line: string): boolean => line.startsWith('Meta: 5%'))).toBeLessThan(
            lines.findIndex((line: string): boolean => line.startsWith('Atual:'))
        );
    });

    it('o toque abre o tooltip', async () => {
        installOverviewApi();
        const user: UserEvent = await openOverview();

        await user.click(screen.getAllByRole('button', { name: /^Cripto:/ })[0] as HTMLElement);

        expect(within(await openTooltip()).getByText('Desvio: +6,7 pp')).toBeInTheDocument();
    });

    it('o medidor da tabela mostra o mesmo tooltip', async () => {
        installOverviewApi();
        const user: UserEvent = await openOverview();
        const table: HTMLElement = screen.getByRole('table', { name: 'Distribuição por classe' });
        const row: HTMLElement = within(table).getAllByRole('row')[8] as HTMLElement;

        await user.hover(row.querySelector('[aria-hidden="true"].relative')?.parentElement as HTMLElement);

        expect(within(await openTooltip()).getByText('Desvio: +6,7 pp')).toBeInTheDocument();
    });
});

describe('visão geral: aviso de qualidade', () => {
    it('lista um item por contador maior que zero com o link para Meus ativos', async () => {
        installOverviewApi({
            overview: overviewWithQuality({
                missingQuotes: 2,
                staleQuotes: 1,
                estimatedFixedIncome: 3,
                indexDataMissing: 1,
                missingRates: 1
            })
        });
        await openOverview();

        const alert: HTMLElement = screen.getByRole('alert');
        expect(within(alert).getAllByRole('listitem')).toHaveLength(5);
        expect(alert).toHaveTextContent('2 ativos ainda sem cotação: o valor deles não entra no total.');
        expect(alert).toHaveTextContent('1 cotação desatualizada.');
        expect(alert).toHaveTextContent('Renda fixa calculada por estimativa.');
        expect(alert).toHaveTextContent('1 título sem dado do índice.');
        expect(alert).toHaveTextContent('Sem câmbio disponível para parte dos valores.');
        expect(within(alert).getByRole('link', { name: 'Ver meus ativos' })).toHaveAttribute('href', '/patrimonio/ativos');
    });

    it('com um único contador mostra só aquele item', async () => {
        installOverviewApi({
            overview: overviewWithQuality({ missingQuotes: 1, estimatedFixedIncome: 0 })
        });
        await openOverview();

        const alert: HTMLElement = screen.getByRole('alert');
        expect(within(alert).getAllByRole('listitem')).toHaveLength(1);
        expect(alert).toHaveTextContent('1 ativo ainda sem cotação: o valor dele não entra no total.');
    });

    it('sem nenhum contador não mostra o aviso', async () => {
        installOverviewApi({ overview: overviewWithQuality({ estimatedFixedIncome: 0 }) });
        await openOverview();

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});

describe('visão geral: estados', () => {
    it('carteira vazia mostra o estado vazio com o caminho para cadastrar', async () => {
        installOverviewApi({ overview: emptyOverview() });
        renderRouterAt('/patrimonio', { signedIn: true });

        expect(await screen.findByRole('heading', { name: 'Sua carteira ainda está vazia' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Cadastrar meu primeiro ativo' })).toHaveAttribute('href', '/patrimonio/comecar');
        expect(screen.getByRole('radiogroup', { name: 'Moeda base' })).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('mostra o esqueleto enquanto carrega', async () => {
        installOverviewApi();
        renderRouterAt('/patrimonio', { signedIn: true });

        expect(await screen.findByRole('status', { name: '' })).toHaveTextContent('Carregando a visão geral');
        await screen.findByText('R$ 1.773.100,40');
    });

    it('erro 500 mostra o código da requisição e tenta de novo', async () => {
        const api: OverviewApi = installOverviewApi({ failures: 1 });
        renderRouterAt('/patrimonio', { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar a visão geral.')).toBeInTheDocument();
        expect(screen.getByText(/req-123/)).toBeInTheDocument();

        await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }));

        expect(await screen.findByText('R$ 1.773.100,40')).toBeInTheDocument();
        expect(api.overviewCalls()).toBe(2);
    });

    it('em inglês traduz os textos e formata o dinheiro', async () => {
        installOverviewApi();
        renderRouterAt('/patrimonio', { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByText('R$1,773,100.40')).toBeInTheDocument();
        expect(screen.getByText('Total net worth')).toBeInTheDocument();
        expect(screen.getByText('Largest deviation: Crypto, 6.7 pp above target.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Where to invest' })).toBeInTheDocument();
    });
});
