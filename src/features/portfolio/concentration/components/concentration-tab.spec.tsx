import { afterEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { i18n } from '@/shared/lib/i18n';
import { emptyConcentration, sampleConcentration } from '../../../../../test/fixtures/portfolio';
import { server } from '../../../../../test/msw/server';
import { renderWithProviders } from '../../../../../test/render';
import type { ConcentrationResponse } from '../types';
import { ConcentrationTab } from './concentration-tab';

function mockConcentration(body: ConcentrationResponse): void {
    server.use(http.get('*/portfolio/concentration', () => HttpResponse.json(body)));
}

async function issuerCard(): Promise<HTMLElement> {
    const heading: HTMLElement = await screen.findByRole('heading', { name: 'Por emissor' });
    return heading.closest('section') as HTMLElement;
}

afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
});

describe('ConcentrationTab', () => {
    it('mostra grupos e buckets traduzidos, "e mais N" e "Outros"', async () => {
        mockConcentration(sampleConcentration());
        renderWithProviders(<ConcentrationTab />);

        const card: HTMLElement = await issuerCard();
        expect(within(card).getByText('Itaú Unibanco')).toBeInTheDocument();
        expect(within(card).getByText('ITUB4, CDB Itaú')).toBeInTheDocument();
        expect(within(card).getByText('Fundos e ETFs, vários emissores')).toBeInTheDocument();
        expect(within(card).getByText('IVVB11, HGLG11, BOVA11, XPML11 e mais 3')).toBeInTheDocument();
        expect(within(card).getByText('Cripto, sem emissor')).toBeInTheDocument();
        expect(within(card).getByText('Outros 4 grupos')).toBeInTheDocument();
        expect(within(card).getByRole('img', { name: 'Itaú Unibanco: 50,0%' })).toBeInTheDocument();
        expect(within(card).getByText(/ETFs, fundos imobiliários e cripto não têm um emissor único/)).toBeInTheDocument();
    });

    it('traduz os buckets sem emissor cadastrado e sem emissor no catálogo', async () => {
        mockConcentration(
            sampleConcentration({
                byIssuer: [
                    { key: 'missing_issuer', kind: 'bucket', name: null, valueMinor: 600, shareBps: 6000, assets: [], moreCount: 0 },
                    { key: 'unmapped', kind: 'bucket', name: null, valueMinor: 400, shareBps: 4000, assets: [], moreCount: 0 }
                ],
                byIssuerOthers: null
            })
        );
        renderWithProviders(<ConcentrationTab />);

        expect(await screen.findByText('Sem emissor cadastrado')).toBeInTheDocument();
        expect(screen.getByText('Sem emissor no catálogo')).toBeInTheDocument();
        expect(screen.queryByText(/Outros/)).not.toBeInTheDocument();
    });

    it('mostra o setor traduzido pela chave, o total da renda variável e a nota', async () => {
        mockConcentration(sampleConcentration());
        renderWithProviders(<ConcentrationTab />);

        const heading: HTMLElement = await screen.findByRole('heading', { name: 'Por setor' });
        const card: HTMLElement = heading.closest('section') as HTMLElement;
        expect(within(card).getByText('Financeiro')).toBeInTheDocument();
        expect(within(card).getByText('Imobiliário: logística')).toBeInTheDocument();
        expect(within(card).getByText(/percentual da renda variável \(R\$\s4\.000,00\)/)).toBeInTheDocument();
        expect(within(card).getByText(/ETFs de índice somam vários setores/)).toBeInTheDocument();
        expect(within(card).getByRole('img', { name: 'Financeiro: 75,0%' })).toBeInTheDocument();
    });

    it('chave de setor desconhecida cai em "Sem setor no catálogo"', async () => {
        mockConcentration(
            sampleConcentration({
                bySector: [
                    { key: 'unmapped_sector', valueMinor: 100, shareBps: 5000, assets: ['AAA1'], moreCount: 0 },
                    { key: 'setor_novo', valueMinor: 100, shareBps: 5000, assets: ['BBB1'], moreCount: 0 }
                ]
            })
        );
        renderWithProviders(<ConcentrationTab />);

        expect(await screen.findAllByText('Sem setor no catálogo')).toHaveLength(2);
    });

    it('sem renda variável mostra o vazio do setor, sem a nota', async () => {
        mockConcentration(emptyConcentration());
        renderWithProviders(<ConcentrationTab />);

        expect(await screen.findByText('Nenhuma ação, FII ou REIT cadastrado.')).toBeInTheDocument();
        expect(screen.queryByText(/O setor vem do catálogo/)).not.toBeInTheDocument();
    });

    it('formata o valor na moeda base USD', async () => {
        mockConcentration(sampleConcentration({ baseCurrency: 'USD' }));
        renderWithProviders(<ConcentrationTab />);

        expect(await screen.findByText(/US\$\s5\.000,00/)).toBeInTheDocument();
    });

    it('em inglês traduz os buckets e os setores', async () => {
        await i18n.changeLanguage('en');
        mockConcentration(sampleConcentration());
        renderWithProviders(<ConcentrationTab />);

        expect(await screen.findByText('Crypto, no issuer')).toBeInTheDocument();
        expect(screen.getByText('Real estate: logistics')).toBeInTheDocument();
        expect(screen.getByText('Other 4 groups')).toBeInTheDocument();
    });

    it('mantém Tesouro Nacional em pt-BR para o grupo da chave', async () => {
        const treasury: ConcentrationResponse = sampleConcentration({
            byIssuer: [
                {
                    key: 'tesouro-nacional',
                    kind: 'group',
                    name: 'Tesouro Nacional',
                    valueMinor: 1000,
                    shareBps: 10000,
                    assets: [],
                    moreCount: 0
                }
            ],
            byIssuerOthers: null
        });
        mockConcentration(treasury);
        renderWithProviders(<ConcentrationTab />);
        expect(await screen.findByText('Tesouro Nacional')).toBeInTheDocument();
    });

    it('em inglês mostra National Treasury para o grupo Tesouro Nacional', async () => {
        await i18n.changeLanguage('en');
        mockConcentration(
            sampleConcentration({
                byIssuer: [
                    {
                        key: 'tesouro-nacional',
                        kind: 'group',
                        name: 'Tesouro Nacional',
                        valueMinor: 1000,
                        shareBps: 10000,
                        assets: [],
                        moreCount: 0
                    }
                ],
                byIssuerOthers: null
            })
        );
        renderWithProviders(<ConcentrationTab />);

        expect(await screen.findByText('National Treasury')).toBeInTheDocument();
        expect(screen.queryByText('Tesouro Nacional')).not.toBeInTheDocument();
    });

    it('mostra o carregamento e depois o erro, e tenta de novo', async () => {
        const user: UserEvent = userEvent.setup();
        server.use(
            http.get('*/portfolio/concentration', () =>
                HttpResponse.json({ type: 'x', title: 'x', status: 500, detail: 'falhou', requestId: 'r1' }, { status: 500 })
            )
        );
        renderWithProviders(<ConcentrationTab />);

        expect(screen.getByRole('status')).toHaveTextContent('Carregando a concentração da carteira');
        expect(await screen.findByText('Não foi possível carregar a concentração.')).toBeInTheDocument();

        mockConcentration(sampleConcentration());
        await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
        expect(await screen.findByText('Itaú Unibanco')).toBeInTheDocument();
    });
});
