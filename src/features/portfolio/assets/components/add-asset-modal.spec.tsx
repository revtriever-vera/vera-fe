import { track } from '@/shared/lib/analytics';
import { describe, expect, it } from 'vitest';
import type { CatalogAsset } from '../types';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { i18n } from '@/shared/lib/i18n';
import { BITCOIN, IVVB11, TESOURO, UNMAPPED_ETF, catalogAsset, quote } from '../../../../../test/fixtures/assets';
import { emptyHoldings } from '../../../../../test/fixtures/portfolio';
import {
    chooseType,
    fillQuantity,
    renderAddAsset,
    searchAsset,
    submitAdd,
    type AddAssetSetup
} from '../../../../../test/helpers/add-asset';
import { mockAssetsApi, problem, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';

const ITUB4: CatalogAsset = catalogAsset();

describe('AddAssetModal: passo 1', () => {
    it('abre com o título, o apoio e os sete tipos', async () => {
        renderAddAsset();

        expect(await screen.findByRole('dialog', { name: 'O que você quer adicionar?' })).toBeInTheDocument();
        expect(screen.getByText('Escolha o tipo de investimento. Você pode adicionar quantos quiser, um de cada vez.')).toBeInTheDocument();
        expect(within(screen.getByRole('group', { name: 'Tipos de investimento' })).getAllByRole('button')).toHaveLength(7);
    });

    it('não renderiza nada fechado', () => {
        const { container } = (() => {
            renderAddAsset({ open: false });
            return { container: document.body };
        })();

        expect(container.querySelector('[role="dialog"]')).toBeNull();
    });

    it('Cancelar e Esc fecham', async () => {
        const { user, onOpenChange }: AddAssetSetup = renderAddAsset();
        await screen.findByRole('dialog');

        await user.click(screen.getByRole('button', { name: 'Cancelar' }));
        await user.keyboard('{Escape}');

        expect(onOpenChange).toHaveBeenCalledTimes(2);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('abre direto no passo 2 com initialType e volta aos tipos com o foco no card', async () => {
        mockAssetsApi({ assets: [ITUB4] });
        const { user }: AddAssetSetup = renderAddAsset({ initialType: 'acoes_br' });

        expect(await screen.findByRole('dialog', { name: 'Ações brasileiras' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Voltar aos tipos' }));

        const card: HTMLElement = await screen.findByRole('button', { name: /Ações brasileiras/ });
        await waitFor(() => {
            expect(card).toHaveFocus();
        });
    });
});

describe('AddAssetModal: renda variável', () => {
    it('ITUB4: busca, escolhe, informa 100, vê R$ 3.780,00 e adiciona com a classe sugerida', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        let holdingsCalls: number = 0;
        server.use(
            http.get('*/portfolio/holdings', () => {
                holdingsCalls += 1;
                return HttpResponse.json(emptyHoldings());
            })
        );
        const { user, onOpenChange }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');

        const option: HTMLElement = await searchAsset(user, 'itub', /ITUB4/);
        await waitFor(() => {
            expect(within(option).getByText('R$ 37,80')).toBeInTheDocument();
        });
        await user.click(option);
        await fillQuantity(user, '100');

        expect(await screen.findByText('R$ 3.780,00')).toBeInTheDocument();
        expect(screen.getByText('Valor estimado, atualizado todo dia pela cotação')).toBeInTheDocument();
        await submitAdd(user);

        await waitFor(() => {
            expect(api.positionBodies).toEqual([{ assetId: 'asset-itub4', quantity: '100', classId: 'class-acoes-br' }]);
        });
        expect(await screen.findByText('ITUB4 adicionado em Ações Brasil')).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(track).toHaveBeenCalledWith('portfolio_asset_added', { type: 'acoes_br', source: 'search' });
        await waitFor(() => {
            expect(holdingsCalls).toBeGreaterThan(1);
        });
    });

    it('busca os populares ao abrir e a busca espera o debounce antes de repetir', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        await screen.findByRole('option', { name: /ITUB4/ });

        await user.type(screen.getByRole('searchbox'), 'itub');
        await waitFor(() => {
            expect(api.searches).toContain('acoes_br|itub');
        });

        expect(api.searches[0]).toBe('acoes_br|');
        expect(api.searches.filter((entry: string): boolean => entry.endsWith('|i') || entry.endsWith('|it'))).toEqual([]);
        expect(api.quoteRequests.every((ids: string): boolean => ids.split(',').length <= 30)).toBe(true);
    });

    it('IVVB11: mostra o aviso de exposição e a classe Ações EUA; trocar a classe envia a escolhida', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [IVVB11], quotes: [quote('asset-ivvb11', '300')] });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações americanas');

        const option: HTMLElement = await searchAsset(user, 'ivvb', /IVVB11/);
        expect(within(option).getByText('ETF negociado na B3 com exposição a ações dos EUA')).toBeInTheDocument();
        await user.click(option);
        await fillQuantity(user, '10');

        expect(
            await screen.findByText(
                'ETF negociado na B3 com exposição a ações dos EUA, por isso entra em Ações EUA. Você pode trocar a classe.'
            )
        ).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Classe' })).toHaveTextContent('Ações EUA');
        await user.click(screen.getByRole('combobox', { name: 'Classe' }));
        await user.click(await screen.findByRole('option', { name: 'FIIs' }));
        await submitAdd(user);

        await waitFor(() => {
            expect(api.positionBodies).toEqual([{ assetId: 'asset-ivvb11', quantity: '10', classId: 'class-fii' }]);
        });
    });

    it('ativo sem sugestão: classe vazia e salvar sem escolher mostra o erro', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [UNMAPPED_ETF], quotes: [quote('asset-xyz11', '10')] });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        server.use(
            http.get('*/catalog/assets', () => HttpResponse.json({ data: [UNMAPPED_ETF] })),
            http.get('*/market-data/quotes', () => HttpResponse.json({ quotes: [quote('asset-xyz11', '10')], pendingAssetIds: [] }))
        );
        await user.click(await screen.findByRole('option', { name: /XYZ11/ }));
        await fillQuantity(user, '5');

        expect(screen.getByRole('combobox', { name: 'Classe' })).toHaveTextContent('Escolha a classe');
        expect(screen.getByText('Não temos uma sugestão para este ativo. Escolha a classe em que ele entra.')).toBeInTheDocument();
        const classField: HTMLElement = screen.getByRole('combobox', { name: 'Classe' });
        expect(screen.getByRole('button', { name: 'Adicionar à carteira' })).toBeEnabled();
        await submitAdd(user);

        const error: HTMLElement = await screen.findByText('Escolha a classe do ativo.');
        expect(error).toHaveAttribute('role', 'alert');
        expect(classField).toBeInvalid();
        expect(classField).toHaveAccessibleDescription('Escolha a classe do ativo.');
        expect(api.positionBodies).toEqual([]);
        await user.click(classField);
        await user.click(await screen.findByRole('option', { name: 'Cripto' }));
        await submitAdd(user);

        await waitFor(() => {
            expect(api.positionBodies).toEqual([{ assetId: 'asset-xyz11', quantity: '5', classId: 'class-cripto' }]);
        });
    });

    it('Tesouro aceita só duas casas e cripto oito', async () => {
        mockAssetsApi({
            assets: [TESOURO, BITCOIN],
            quotes: [
                quote('asset-tesouro', '14000', { source: 'tesouro_direto' }),
                quote('asset-btc', '60000', { currency: 'USD', source: 'coingecko' })
            ]
        });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Tesouro Direto');
        await user.click(await screen.findByRole('option', { name: /Tesouro Selic 2029/ }));

        await fillQuantity(user, '3,205');
        await user.tab();
        expect(await screen.findByText('Este ativo aceita até 2 casas decimais.')).toBeInTheDocument();
        await fillQuantity(user, '3,2');
        await waitFor(() => {
            expect(screen.queryByText('Este ativo aceita até 2 casas decimais.')).toBeNull();
        });
        expect(screen.getByText('Valor estimado, atualizado todo dia pelo preço oficial do Tesouro')).toBeInTheDocument();
        expect(await screen.findByText('R$ 44.800,00')).toBeInTheDocument();
        expect(screen.getByText('Tesouro Transparente')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Voltar aos tipos' }));
        await chooseType(user, 'Criptomoedas');
        await user.click(await screen.findByRole('option', { name: /BTC/ }));
        await fillQuantity(user, '0,45');
        await user.tab();

        expect(screen.queryByRole('alert')).toBeNull();
        expect(await screen.findByText('R$ 146.340,00')).toBeInTheDocument();
    });
});

describe('AddAssetModal: erros', () => {
    async function pickItub(setup: AddAssetSetup): Promise<void> {
        await chooseType(setup.user, 'Ações brasileiras');
        await setup.user.click(await screen.findByRole('option', { name: /ITUB4/ }));
        await fillQuantity(setup.user, '10');
    }

    it('invalid_quantity aparece no campo de quantidade', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        server.use(http.post('*/positions', () => problem('positions.invalid_quantity', 422)));
        const setup: AddAssetSetup = renderAddAsset();
        await pickItub(setup);
        await submitAdd(setup.user);

        expect(await screen.findByText('A quantidade informada não é válida para esse ativo.')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Quantidade' })).toBeInvalid();
        expect(setup.onOpenChange).not.toHaveBeenCalled();
    });

    it('class_required aparece no campo de classe', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        server.use(http.post('*/positions', () => problem('positions.class_required', 422)));
        const setup: AddAssetSetup = renderAddAsset();
        await pickItub(setup);
        await submitAdd(setup.user);

        expect(await screen.findByText('Escolha a classe do ativo.')).toBeInTheDocument();
    });

    it('limit_reached vira um alerta dentro do modal', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        server.use(http.post('*/positions', () => problem('positions.limit_reached', 422)));
        const setup: AddAssetSetup = renderAddAsset();
        await pickItub(setup);
        await submitAdd(setup.user);

        expect(await screen.findByText('Você chegou ao limite de ativos da carteira.')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('falha de rede vira toast crítico e o modal continua aberto', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        server.use(http.post('*/positions', () => HttpResponse.error()));
        const setup: AddAssetSetup = renderAddAsset();
        await pickItub(setup);
        await submitAdd(setup.user);

        expect(await screen.findByText('Não foi possível adicionar')).toBeInTheDocument();
        expect(screen.getByText('Algo deu errado. Tente de novo em instantes.')).toBeInTheDocument();
        expect(setup.onOpenChange).not.toHaveBeenCalled();
    });

    it('durante o envio o botão fica ocupado e mostra Adicionando…', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        let release: () => void = (): void => undefined;
        const gate: Promise<void> = new Promise<void>((resolve: () => void): void => {
            release = resolve;
        });
        server.use(
            http.post('*/positions', async () => {
                await gate;
                return HttpResponse.json(
                    {
                        id: 'p',
                        assetId: 'asset-itub4',
                        quantity: '10',
                        averagePrice: null,
                        classId: 'class-acoes-br',
                        createdAt: '2026-10-09T00:00:00.000Z',
                        updatedAt: '2026-10-09T00:00:00.000Z'
                    },
                    { status: 201 }
                );
            })
        );
        const setup: AddAssetSetup = renderAddAsset();
        await pickItub(setup);
        await submitAdd(setup.user);

        const busy: HTMLElement = await screen.findByRole('button', { name: 'Adicionando…' });
        expect(busy).toBeDisabled();
        expect(busy).toHaveAttribute('aria-busy', 'true');
        release();
        await waitFor(() => {
            expect(setup.onOpenChange).toHaveBeenCalledWith(false);
        });
    });
});

describe('AddAssetModal: busca', () => {
    it('mostra a mensagem de busca sem resultado', async () => {
        mockAssetsApi({ assets: [ITUB4] });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        await user.type(await screen.findByRole('searchbox'), 'zzzz');

        expect(await screen.findByText('Nada encontrado para essa busca.')).toBeInTheDocument();
    });

    it('mostra buscando preço… enquanto a cotação está pendente', async () => {
        mockAssetsApi({ assets: [ITUB4], pending: ['asset-itub4'] });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');

        expect(await screen.findByText('buscando preço…')).toBeInTheDocument();
    });

    it('mostra o alerta quando a busca falha', async () => {
        server.use(http.get('*/catalog/assets', () => HttpResponse.error()));
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');

        expect(await screen.findByText('Não foi possível buscar agora. Tente de novo em instantes.')).toBeInTheDocument();
    });

    it('navega entre os resultados com as setas', async () => {
        mockAssetsApi({ assets: [ITUB4, catalogAsset({ id: 'asset-petr4', symbol: 'PETR4', name: 'Petrobras PN' })] });
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        const first: HTMLElement = await screen.findByRole('option', { name: /ITUB4/ });
        const second: HTMLElement = await screen.findByRole('option', { name: /PETR4/ });
        first.focus();

        await user.keyboard('{ArrowDown}');
        expect(second).toHaveFocus();
        await user.keyboard('{ArrowUp}');
        expect(first).toHaveFocus();
        await user.keyboard('{End}');
        expect(second).toHaveFocus();
        await user.keyboard('{Home}');
        expect(first).toHaveFocus();
        await user.keyboard('{Enter}');

        expect(first).toHaveAttribute('aria-selected', 'true');
        expect(second).toHaveAttribute('aria-selected', 'false');
    });
});

describe('AddAssetModal: inglês', () => {
    it('traduz o fluxo', async () => {
        await i18n.changeLanguage('en');
        try {
            mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
            const { user }: AddAssetSetup = renderAddAsset();

            expect(await screen.findByRole('dialog', { name: 'What do you want to add?' })).toBeInTheDocument();
            await user.click(screen.getByRole('button', { name: /Brazilian stocks/ }));
            await user.click(await screen.findByRole('option', { name: /ITUB4/ }));
            await user.type(screen.getByRole('textbox', { name: 'Quantity' }), '100');

            expect(await screen.findByText('R$3,780.00')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Add to portfolio' })).toBeEnabled();
        } finally {
            await i18n.changeLanguage('pt-BR');
        }
    });
});
