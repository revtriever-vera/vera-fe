import { track } from '@/shared/lib/analytics';
import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { previewResult } from '../../../../../test/fixtures/assets';
import { chooseType, renderAddAsset, submitAdd, type AddAssetSetup } from '../../../../../test/helpers/add-asset';
import { mockAssetsApi, problem, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';

async function fillCdb(user: UserEvent): Promise<void> {
    await user.type(await screen.findByRole('textbox', { name: 'Nome do título' }), 'CDB Banco XP');
    const rate: HTMLElement = screen.getByRole('textbox', { name: 'Percentual do CDI' });
    await user.clear(rate);
    await user.type(rate, '110');
    await user.type(screen.getByRole('textbox', { name: 'Valor aplicado' }), '50000');
    await user.type(screen.getByRole('textbox', { name: 'Data da aplicação' }), '10032025');
    await user.type(screen.getByRole('textbox', { name: 'Vencimento' }), '10032028');
}

async function pickIndexer(user: UserEvent, name: string): Promise<void> {
    await user.click(screen.getByRole('combobox', { name: 'Indexador' }));
    await user.click(await screen.findByRole('option', { name }));
}

async function openFixedIncome(): Promise<AddAssetSetup> {
    const setup: AddAssetSetup = renderAddAsset();
    await chooseType(setup.user, 'Renda fixa');
    return setup;
}

describe('AddAssetModal: renda fixa', () => {
    it('abre com o formulário, o aviso do Tesouro e a prévia vazia', async () => {
        mockAssetsApi();
        await openFixedIncome();

        expect(await screen.findByRole('dialog', { name: 'Renda fixa' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Percentual do CDI' })).toHaveValue('105');
        expect(screen.getByRole('combobox', { name: 'Classe' })).toHaveTextContent('Renda fixa pós');
        expect(screen.getByText(/Tem Tesouro Direto\?/)).toBeInTheDocument();
        expect(screen.getByText('Preencha os dados do título para ver quanto ele vale hoje.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Adicionar à carteira' })).toBeDisabled();
    });

    it('CDB 110% do CDI: a prévia vem da API uma vez só e o título é salvo com taxa em pontos-base', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user, onOpenChange }: AddAssetSetup = await openFixedIncome();
        await fillCdb(user);

        expect(await screen.findByText('Valor estimado hoje')).toBeInTheDocument();
        expect(screen.getByText('R$ 61.250,00')).toBeInTheDocument();
        expect(screen.getByText(/R\$ 50\.000,00 aplicados há 1,6 anos · 13,6\d% a\.a\./)).toBeInTheDocument();
        expect(screen.getByText('Curva do CDI (BC)')).toBeInTheDocument();
        expect(screen.getByText('vence 10/03/2028')).toBeInTheDocument();
        expect(screen.getByText(/O sistema recalcula esse valor todo dia/)).toBeInTheDocument();
        expect(api.previewBodies).toEqual([
            {
                kind: 'cdb',
                indexer: 'cdi_percent',
                rateBps: 11000,
                currency: 'BRL',
                appliedMinor: 5000000,
                appliedAt: '2025-03-10',
                maturityDate: '2028-03-10'
            }
        ]);

        await submitAdd(user);
        await waitFor(() => {
            expect(api.titleBodies).toEqual([{ ...api.previewBodies[0], name: 'CDB Banco XP', classId: 'class-rf-pos' }]);
        });
        expect(await screen.findByText('CDB Banco XP adicionado em Renda fixa pós')).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(track).toHaveBeenCalledWith('portfolio_asset_added', { type: 'fixed_income', source: 'fixed_income' });
    });

    it('dois CDBs iguais podem ser adicionados em sequência', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await fillCdb(user);
        await screen.findByText('R$ 61.250,00');

        await submitAdd(user);
        await waitFor(() => {
            expect(api.titleBodies).toHaveLength(1);
        });
        await submitAdd(user);

        await waitFor(() => {
            expect(api.titleBodies).toHaveLength(2);
        });
        expect(api.titleBodies[1]).toEqual(api.titleBodies[0]);
    });

    it('mudar o indexador troca o rótulo, a taxa sugerida e a classe', async () => {
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await screen.findByRole('textbox', { name: 'Percentual do CDI' });

        await pickIndexer(user, 'Prefixado');
        expect(screen.getByRole('textbox', { name: 'Taxa ao ano (%)' })).toHaveValue('12,5');
        expect(screen.getByRole('combobox', { name: 'Classe' })).toHaveTextContent('Renda fixa pré');

        await pickIndexer(user, 'IPCA+');
        expect(screen.getByRole('textbox', { name: 'Taxa real ao ano (%) acima do IPCA' })).toHaveValue('6,2');
        expect(screen.getByRole('combobox', { name: 'Classe' })).toHaveTextContent('Renda fixa IPCA+');
        expect(screen.queryByRole('radio', { name: 'USD' })).toBeNull();
    });

    it('não troca a classe que a pessoa escolheu ao mudar o indexador', async () => {
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await user.click(await screen.findByRole('combobox', { name: 'Classe' }));
        await user.click(await screen.findByRole('option', { name: 'FIIs' }));

        await pickIndexer(user, 'Prefixado');

        expect(screen.getByRole('combobox', { name: 'Classe' })).toHaveTextContent('FIIs');
    });

    it('moeda em dólar só com prefixado e volta para real ao sair dele', async () => {
        const api: AssetsApi = mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await screen.findByRole('textbox', { name: 'Percentual do CDI' });
        await pickIndexer(user, 'Prefixado');

        await user.click(screen.getByRole('radio', { name: 'USD' }));
        expect(screen.getByRole('radio', { name: 'USD' })).toBeChecked();
        expect(screen.getByText('US$')).toBeInTheDocument();
        await pickIndexer(user, '% do CDI');

        expect(screen.queryByRole('radio', { name: 'USD' })).toBeNull();
        expect(screen.getByText('R$')).toBeInTheDocument();
        expect(api.titleBodies).toEqual([]);
    });

    it('valida vencimento antes da aplicação e mantém o botão desabilitado', async () => {
        mockAssetsApi();
        const { user }: AddAssetSetup = await openFixedIncome();
        await user.type(await screen.findByRole('textbox', { name: 'Vencimento' }), '10032026');
        await user.type(screen.getByRole('textbox', { name: 'Data da aplicação' }), '10032026');

        expect(await screen.findByText('O vencimento precisa ser depois da aplicação.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Adicionar à carteira' })).toBeDisabled();
    });

    it('mostra o aviso e o valor aplicado quando faltam as séries do Banco Central', async () => {
        mockAssetsApi({ preview: previewResult({ status: 'index_data_missing', valueMinor: 0 }) });
        const { user }: AddAssetSetup = await openFixedIncome();
        await fillCdb(user);

        expect(await screen.findByText(/Ainda não temos as séries do Banco Central/)).toBeInTheDocument();
        expect(screen.getByText('R$ 50.000,00')).toBeInTheDocument();
    });

    it('rotula o título vencido', async () => {
        mockAssetsApi({ preview: previewResult({ matured: true }) });
        const { user }: AddAssetSetup = await openFixedIncome();
        await fillCdb(user);

        expect(await screen.findByText('Valor estimado no vencimento')).toBeInTheDocument();
        expect(screen.getByText('Vencido')).toBeInTheDocument();
    });

    it('avisa quando a prévia falha, sem impedir o cadastro', async () => {
        const api: AssetsApi = mockAssetsApi();
        server.use(http.post('*/fixed-income/preview', () => problem('fixed_income.invalid_terms', 422)));
        const { user }: AddAssetSetup = await openFixedIncome();
        await fillCdb(user);

        expect(await screen.findByText('Não foi possível calcular agora. Você ainda pode adicionar o título.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Adicionar à carteira' })).toBeEnabled();
        expect(api.titleBodies).toEqual([]);
    });

    it('mostra o erro de regra da API num alerta', async () => {
        mockAssetsApi();
        server.use(http.post('*/fixed-income/titles', () => problem('fixed_income.applied_date_out_of_range', 422)));
        const { user, onOpenChange }: AddAssetSetup = await openFixedIncome();
        await fillCdb(user);
        await screen.findByText('R$ 61.250,00');
        await submitAdd(user);

        const alert: HTMLElement = await screen.findByText('A data da aplicação está fora do período aceito.');
        expect(
            within(alert.closest('[role="alert"]') as HTMLElement).getByText('A data da aplicação está fora do período aceito.')
        ).toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('usa a classe de entrada e traduz o tipo do título', async () => {
        mockAssetsApi();
        const setup: AddAssetSetup = renderAddAsset({ initialType: 'fixed_income', initialClassId: 'class-fii' });

        expect(await screen.findByRole('combobox', { name: 'Classe' })).toHaveTextContent('FIIs');
        await setup.user.click(screen.getByRole('combobox', { name: 'Tipo do título' }));
        await setup.user.click(await screen.findByRole('option', { name: 'LCI' }));

        expect(screen.getByRole('combobox', { name: 'Tipo do título' })).toHaveTextContent('LCI');
    });
});
