import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import type { CatalogAsset } from '../types';
import { ANA, TWO_PEOPLE } from '../../../../../test/fixtures/people';
import { catalogAsset, quote } from '../../../../../test/fixtures/assets';
import {
    chooseType,
    fillQuantity,
    renderAddAsset,
    searchAsset,
    submitAdd,
    type AddAssetSetup
} from '../../../../../test/helpers/add-asset';
import { mockAssetsApi, type AssetsApi } from '../../../../../test/helpers/assets-api';

const ITUB4: CatalogAsset = catalogAsset();

async function pickItub4(setup: AddAssetSetup): Promise<void> {
    await chooseType(setup.user, 'Ações brasileiras');
    await setup.user.click(await searchAsset(setup.user, 'itub', /ITUB4/));
    await fillQuantity(setup.user, '100');
}

describe('AddAssetModal: titular', () => {
    it('com uma pessoa não mostra o campo nem manda o titular', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        const setup: AddAssetSetup = renderAddAsset();
        await pickItub4(setup);

        expect(screen.queryByRole('combobox', { name: 'Titular' })).toBeNull();
        await submitAdd(setup.user);

        await waitFor(() => {
            expect(api.positionBodies).toEqual([{ assetId: 'asset-itub4', quantity: '100', classId: 'class-acoes-br' }]);
        });
    });

    it('com duas pessoas o campo nasce em Conta toda e manda titular nulo', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        const setup: AddAssetSetup = renderAddAsset({}, TWO_PEOPLE);
        await pickItub4(setup);

        expect(await screen.findByRole('combobox', { name: 'Titular' })).toHaveTextContent('Conta toda');
        await submitAdd(setup.user);

        await waitFor(() => {
            expect(api.positionBodies).toEqual([
                { assetId: 'asset-itub4', quantity: '100', classId: 'class-acoes-br', holderUserId: null }
            ]);
        });
    });

    it('escolher a Ana manda o id dela', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [ITUB4], quotes: [quote('asset-itub4', '37.80')] });
        const setup: AddAssetSetup = renderAddAsset({}, TWO_PEOPLE);
        await pickItub4(setup);

        await setup.user.click(await screen.findByRole('combobox', { name: 'Titular' }));
        await setup.user.click(await screen.findByRole('option', { name: 'Ana Souza' }));
        await submitAdd(setup.user);

        await waitFor(() => {
            expect(api.positionBodies).toEqual([
                { assetId: 'asset-itub4', quantity: '100', classId: 'class-acoes-br', holderUserId: ANA.userId }
            ]);
        });
    });
});
