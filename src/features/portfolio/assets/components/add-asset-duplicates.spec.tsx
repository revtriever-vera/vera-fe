import { describe, expect, it } from 'vitest';
import type { CatalogAsset } from '../types';
import type { HoldingsResponse } from '../../types';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { catalogAsset, positionView, quote } from '../../../../../test/fixtures/assets';
import { emptyHoldings, holding } from '../../../../../test/fixtures/portfolio';
import { chooseType, renderAddAsset, type AddAssetSetup } from '../../../../../test/helpers/add-asset';
import { mockAssetsApi, problem, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';

const ITUB4: CatalogAsset = catalogAsset();
const HELD: HoldingsResponse = { ...emptyHoldings(), data: [holding({ id: 'position-itub4', assetId: 'asset-itub4' })] };

describe('AddAssetModal: ativo que já está na carteira', () => {
    it('mostra o chip e leva à edição da posição existente, sem criar outra', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')], holdings: HELD });
        server.use(http.get('*/positions/:id', () => HttpResponse.json(positionView({ quantity: '2000' }))));
        const { user, onOpenChange }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        const option: HTMLElement = await screen.findByRole('option', { name: /ITUB4/ });

        expect(within(option).getByText('Já na carteira')).toBeInTheDocument();
        await user.click(option);

        expect(await screen.findByRole('heading', { name: 'Você já tem este ativo' })).toBeInTheDocument();
        expect(await screen.findByText('2.000')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Adicionar à carteira' })).toBeNull();
        const field: HTMLElement = screen.getByRole('textbox', { name: 'Nova quantidade' });
        expect(field).toHaveValue('2000');
        await user.clear(field);
        await user.type(field, '2500');
        await user.click(screen.getByRole('button', { name: 'Atualizar quantidade' }));

        await waitFor(() => {
            expect(api.patchBodies).toEqual([{ id: 'position-itub4', body: { quantity: '2500' } }]);
        });
        expect(api.positionBodies).toEqual([]);
        expect(await screen.findByText('ITUB4 atualizado')).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('valida as casas decimais ao atualizar e mostra o erro da API no campo', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')], holdings: HELD });
        server.use(http.patch('*/positions/:id', () => problem('positions.invalid_quantity', 422)));
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        await user.click(await screen.findByRole('option', { name: /ITUB4/ }));
        const field: HTMLElement = await screen.findByRole('textbox', { name: 'Nova quantidade' });

        await user.clear(field);
        await user.type(field, '1,5');
        await user.click(screen.getByRole('button', { name: 'Atualizar quantidade' }));
        expect(await screen.findByText('Este ativo só aceita quantidades inteiras.')).toBeInTheDocument();

        await user.clear(field);
        await user.type(field, '10');
        await user.click(screen.getByRole('button', { name: 'Atualizar quantidade' }));
        expect(await screen.findByText('A quantidade informada não é válida para esse ativo.')).toBeInTheDocument();
    });

    it('mostra o alerta quando a atualização bate no limite', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')], holdings: HELD });
        server.use(http.patch('*/positions/:id', () => problem('validation_failed', 400)));
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        await user.click(await screen.findByRole('option', { name: /ITUB4/ }));
        await user.click(await screen.findByRole('button', { name: 'Atualizar quantidade' }));

        expect(await screen.findByText('Confira os dados informados e tente de novo.')).toBeInTheDocument();
    });

    it('avisa quando a posição existente não abre', async () => {
        mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')], holdings: HELD });
        server.use(http.get('*/positions/:id', () => problem('positions.position_not_found', 404)));
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        await user.click(await screen.findByRole('option', { name: /ITUB4/ }));

        expect(await screen.findByText('Não foi possível abrir a posição existente.')).toBeInTheDocument();
    });

    it('corrida entre abas: o 409 leva à edição da posição existente com um toast neutro', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        server.use(
            http.post('*/positions', () => problem('positions.asset_already_in_portfolio', 409, { positionId: 'position-itub4' })),
            http.get('*/positions/:id', () => HttpResponse.json(positionView({ quantity: '300' })))
        );
        const { user }: AddAssetSetup = renderAddAsset();
        await chooseType(user, 'Ações brasileiras');
        await user.click(await screen.findByRole('option', { name: /ITUB4/ }));
        await user.type(await screen.findByRole('textbox', { name: 'Quantidade' }), '10');
        await user.click(screen.getByRole('button', { name: 'Adicionar à carteira' }));

        expect(await screen.findByRole('heading', { name: 'Você já tem este ativo' })).toBeInTheDocument();
        expect(screen.getByText('Esse ativo já estava na sua carteira. Ajuste a quantidade abaixo.')).toBeInTheDocument();
        expect(await screen.findByText('300')).toBeInTheDocument();
        expect(api.patchBodies).toEqual([]);
    });
});
