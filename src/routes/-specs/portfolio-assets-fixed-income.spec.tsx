import { afterEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { AnyRouter } from '@tanstack/react-router';
import type { FgcHolderBlock } from '@/features/portfolio/fixed-income/types';
import { track } from '@/shared/lib/analytics';
import { i18n } from '@/shared/lib/i18n';
import { emptyFgc, fgcCoverage, fgcGroup, maturities, maturityItem, realRateItem, realRates } from '../../../test/fixtures/fixed-income';
import { sessionIdentity } from '../../../test/fixtures/auth';
import { mockHoldingsApi } from '../../../test/helpers/holdings-api';
import { portfolioSettings } from '../../../test/fixtures/portfolio';
import { clearViewport, stubViewport } from '../../../test/helpers/rules-api';
import { server } from '../../../test/msw/server';
import { renderRouterAt } from '../../../test/router';

const PATH: string = '/portfolio/assets?tab=fixed-income';

afterEach(async () => {
    clearViewport();
    await i18n.changeLanguage('pt-BR');
});

function useData(): void {
    server.use(
        http.get('*/portfolio/maturities', () =>
            HttpResponse.json(
                maturities([
                    maturityItem(),
                    maturityItem({ id: 'title-lci', name: 'LCI Beta', issuerName: null, kind: 'lci', daysToMaturity: 75, soon: true, estimated: true, basis: 'cdi_projection' }),
                    maturityItem({ id: 'td', holdingKind: 'position', name: 'Tesouro IPCA 2035', issuerName: null, kind: null, daysToMaturity: 400, soon: false }),
                    maturityItem({ id: 'far', name: 'CDB Longo', daysToMaturity: 1000, soon: false })
                ])
            )
        ),
        http.get('*/portfolio/real-rates', () =>
            HttpResponse.json(
                realRates([
                    realRateItem(),
                    realRateItem({ id: 'low', name: 'CDB Baixo', indexer: 'prefixed', rateBps: 1240, realAnnualBps: 200, lowReal: true, purchasingPowerGainMinor: -5000, purchasingPowerGainBps: -120 }),
                    realRateItem({ id: 'ipca', name: 'LCA Alfa', kind: 'lca', indexer: 'ipca_plus', rateBps: 610, nominalAnnualBps: null, realAnnualBps: null })
                ])
            )
        ),
        http.get('*/portfolio/fgc', () => HttpResponse.json(fgcCoverage()))
    );
}

describe('/portfolio/assets: abas', () => {
    it('abre na lista sem busca e avisa a aba vista', async () => {
        renderRouterAt('/portfolio/assets', { signedIn: true });

        expect(await screen.findByRole('tab', { name: 'Ativos', selected: true })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Renda fixa', selected: false })).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('assets_tab_viewed', { tab: 'list' });
    });

    it('troca de aba pela URL e o voltar do navegador devolve a lista', async () => {
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt('/portfolio/assets', { signedIn: true });

        await user.click(await screen.findByRole('tab', { name: 'Renda fixa' }));
        expect(router.state.location.search).toEqual({ tab: 'fixed-income' });
        expect(screen.getByRole('tab', { name: 'Renda fixa', selected: true })).toBeInTheDocument();
        expect(track).toHaveBeenCalledWith('assets_tab_viewed', { tab: 'fixed-income' });

        router.history.back();

        expect(await screen.findByRole('tab', { name: 'Ativos', selected: true })).toBeInTheDocument();
    });
});

describe('/portfolio/assets: renda fixa, vencimentos', () => {
    it('mostra título, emissor, data, tempo e valor, com os destaques de 60 e 90 dias', async () => {
        useData();
        renderRouterAt(PATH, { signedIn: true });

        const table: HTMLElement = await screen.findByRole('table', { name: 'Próximos vencimentos' });

        expect(within(table).getByText('Banco Alfa · CDB Banco Alfa')).toBeInTheDocument();
        expect(within(table).getByText('em 42 dias')).toHaveClass('text-caution');
        expect(within(table).getByText('em 2 meses')).not.toHaveClass('text-caution');
        expect(within(table).getByText('em 13 meses')).toBeInTheDocument();
        expect(within(table).getByText('em 2,7 anos')).toBeInTheDocument();
        expect(within(table).getByText('Tesouro Direto')).toBeInTheDocument();
        expect(within(table).getAllByText('R$ 12.345,67')).toHaveLength(4);
        expect(within(table).getByRole('button', { name: 'Realocar o valor de CDB Banco Alfa' })).toHaveClass('bg-accent-strong');
        expect(within(table).getByRole('button', { name: 'Realocar o valor de CDB Longo' })).not.toHaveClass('bg-accent-strong');
    });

    it('a linha estimada ganha o aviso do CDI', async () => {
        useData();
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });
        const table: HTMLElement = await screen.findByRole('table', { name: 'Próximos vencimentos' });

        const row: HTMLElement = within(table).getByText('LCI Beta', { selector: 'span' }).closest('tr') as HTMLElement;
        await user.hover(within(row).getByRole('button', { name: /R\$/ }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Estimado com o CDI de 08/10/2026');
    });

    it('Realocar leva ao Onde aportar com o valor e registra o evento', async () => {
        useData();
        const user: UserEvent = userEvent.setup();
        const router: AnyRouter = renderRouterAt(PATH, { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Realocar o valor de CDB Banco Alfa' }));

        expect(router.state.location.pathname).toBe('/portfolio/contribution');
        expect(router.state.location.search).toEqual({ amount: 12300 });
        expect(track).toHaveBeenCalledWith('maturity_reallocate_clicked', { daysBucket: 'up_to_60' });
    });

    it('sem vencimentos mostra o vazio', async () => {
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Nenhum título com vencimento cadastrado.')).toBeInTheDocument();
    });

    it('erro de uma consulta fica no cartão dela e tenta de novo', async () => {
        useData();
        server.use(http.get('*/portfolio/maturities', () => HttpResponse.json({ type: 'x', title: 'x', status: 500, detail: 'falha', requestId: 'r1' }, { status: 500 })));
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Não foi possível carregar agora.', {}, { timeout: 5000 })).toBeInTheDocument();
        expect(await screen.findByRole('table', { name: 'Taxa real por título' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });
});

describe('/portfolio/assets: renda fixa, taxa real', () => {
    it('mostra o IPCA da resposta, o contratado e a taxa real com texto', async () => {
        useData();
        renderRouterAt(PATH, { signedIn: true });

        const table: HTMLElement = await screen.findByRole('table', { name: 'Taxa real por título' });

        expect(screen.getByText(/descontado o IPCA de 12 meses \(4,5%\)/)).toBeInTheDocument();
        expect(within(table).getAllByText('CDB · aplicado em 10/03/2025')).toHaveLength(2);
        expect(within(table).getByText('110% do CDI')).toBeInTheDocument();
        expect(within(table).getByText('Pré 12,4%')).toBeInTheDocument();
        expect(within(table).getByText('IPCA + 6,1%')).toBeInTheDocument();
        expect(within(table).getByText('abaixo de 3% ao ano').previousSibling).toHaveClass('text-caution');
        expect(within(table).getByText('a partir de 3% ao ano').previousSibling).toHaveClass('text-positive');
        expect(within(table).getByText('poder de compra −1,2%')).toBeInTheDocument();
        expect(within(table).getAllByText('poder de compra +7,69%')).toHaveLength(2);
        expect(screen.getByText(/compara o valor de hoje com o que foi aplicado/)).toBeInTheDocument();
    });
});

describe('/portfolio/assets: renda fixa, FGC', () => {
    it('mostra o medidor e o grupo acima do limite', async () => {
        useData();
        renderRouterAt(PATH, { signedIn: true });

        const table: HTMLElement = await screen.findByRole('table', { name: 'Cobertura por conglomerado' });

        expect(screen.getByRole('meter', { name: 'Coberto pelo FGC' })).toHaveAttribute('aria-valuenow', '25000000');
        expect(screen.getByText('R$ 250.000,00 de R$ 1.000.000,00')).toBeInTheDocument();
        expect(within(table).getByText('Banco Alfa · CDB Banco Alfa')).toBeInTheDocument();
        expect(within(table).getByText('R$ 50.000,00')).toBeInTheDocument();
        expect(screen.queryByText(/O limite do FGC vale por CPF/)).not.toBeInTheDocument();
    });

    it('grupo dentro do limite mostra "dentro"', async () => {
        server.use(http.get('*/portfolio/fgc', () => HttpResponse.json(fgcCoverage({ groups: [fgcGroup({ overMinor: 0, totalMinor: 1000000, coveredMinor: 1000000 })] }))));
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('dentro')).toBeInTheDocument();
    });

    it('sem grupos mostra o vazio', async () => {
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText('Nenhum título coberto pelo FGC.')).toBeInTheDocument();
    });

    it('com duas pessoas avisa que o limite vale por CPF', async () => {
        server.use(http.get('*/portfolio/fgc', () => HttpResponse.json(fgcCoverage({ peopleCount: 2 }))));
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText(/O limite do FGC vale por CPF/)).toBeInTheDocument();
    });

    it('com blocos por titular mostra um bloco para cada pessoa e a conta toda', async () => {
        const block = (name: string | null, overMinor: number): FgcHolderBlock => ({
            holder: name === null ? null : { userId: `id-${name}`, name },
            coveredMinor: 100,
            capShareBps: 100,
            groups: [fgcGroup({ groupId: `g-${name}`, groupName: `Grupo de ${name ?? 'todos'}`, overMinor })],
            outside: []
        });
        server.use(
            http.get('*/portfolio/fgc', () =>
                HttpResponse.json(fgcCoverage({ peopleCount: 2, groups: [], byHolder: [block('Ana', 0), block(null, 10)] }))
            )
        );
        renderRouterAt(PATH, { signedIn: true });

        const ana: HTMLElement = await screen.findByRole('region', { name: 'Ana' });
        expect(within(ana).getByText('Grupo de Ana')).toBeInTheDocument();
        expect(within(screen.getByRole('region', { name: 'Conta toda' })).getByText('Grupo de todos')).toBeInTheDocument();
    });

    it('explica os títulos fora do FGC e pede o emissor de quem não tem', async () => {
        server.use(
            http.get('*/portfolio/fgc', () =>
                HttpResponse.json({
                    ...emptyFgc(),
                    outside: [
                        { id: 'td', name: 'Tesouro Selic', reason: 'tesouro', valueMinor: 100 },
                        { id: 'deb', name: 'Debênture X', reason: 'not_covered_kind', valueMinor: 100 },
                        { id: 'sem', name: 'CDB sem emissor', reason: 'missing_issuer', valueMinor: 100 }
                    ]
                })
            )
        );
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findByText(/Fora do FGC: Tesouro Selic\. Tesouro Direto tem garantia do Tesouro Nacional\./)).toBeInTheDocument();
        expect(screen.getByText(/Fora do FGC: Debênture X\. Debênture, CRI e CRA dependem só da empresa\./)).toBeInTheDocument();
        expect(screen.getByText('Sem emissor: CDB sem emissor. Complete o cadastro para ver a cobertura.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Completar o cadastro de CDB sem emissor' })).toBeInTheDocument();
    });
});

describe('/portfolio/assets: renda fixa, cadastro sem emissor', () => {
    it('Completar o cadastro abre a edição do título', async () => {
        mockHoldingsApi();
        server.use(
            http.get('*/portfolio/fgc', () =>
                HttpResponse.json({ ...emptyFgc(), outside: [{ id: 'fi-cdb', name: 'CDB Inter', reason: 'missing_issuer', valueMinor: 100 }] })
            )
        );
        const user: UserEvent = userEvent.setup();
        renderRouterAt(PATH, { signedIn: true });

        await user.click(await screen.findByRole('button', { name: 'Completar o cadastro de CDB Inter' }));

        expect(await screen.findByRole('dialog', { name: 'Editar CDB Inter' })).toBeInTheDocument();
    });
});

describe('/portfolio/assets: renda fixa, moeda e telas estreitas', () => {
    it('com a base em dólar avisa que os valores são em reais', async () => {
        server.use(http.get('*/allocation/settings', () => HttpResponse.json(portfolioSettings({ baseCurrency: 'USD' }))));
        renderRouterAt(PATH, { signedIn: true });

        expect(await screen.findAllByText('valores em R$')).toHaveLength(3);
    });

    it('em tela estreita as tabelas viram listas de cartões', async () => {
        useData();
        stubViewport(true);
        renderRouterAt(PATH, { signedIn: true });

        const list: HTMLElement = await screen.findByRole('list', { name: 'Próximos vencimentos' });

        expect(within(list).getAllByRole('listitem')).toHaveLength(4);
        expect(screen.queryByRole('table', { name: 'Próximos vencimentos' })).not.toBeInTheDocument();
    });

    it('fala inglês quando o idioma é en', async () => {
        useData();
        renderRouterAt(PATH, { signedIn: true });
        server.use(http.get('*/auth/me', (): Response => HttpResponse.json(sessionIdentity({ locale: 'en' }))));

        expect(await screen.findByRole('heading', { name: 'Upcoming maturities' })).toBeInTheDocument();
    });
});
