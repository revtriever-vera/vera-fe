import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { catalogAsset, quote } from '../../../../../test/fixtures/assets';
import { defaultClasses } from '../../../../../test/fixtures/portfolio';
import { mockAssetsApi, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { renderWithProviders } from '../../../../../test/render';
import { QUOTE_MAX_POLLS, QUOTE_POLL_MS } from '../api/use-quotes.query';
import type { CatalogAsset, CatalogGroup } from '../types';
import { AssetSearch } from './asset-search';

function renderSearch(onPick: Mock = vi.fn(), query: string = ''): void {
    renderWithProviders(
        <AssetSearch
            group="acoes_br"
            typeName="Ações brasileiras"
            query={query}
            onQueryChange={vi.fn()}
            pickedId={null}
            heldAssetIds={new Set<string>()}
            classes={defaultClasses().data}
            onPick={onPick}
        />
    );
}

describe('AssetSearch', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('depois de 10 tentativas sem cotação troca buscando preço… por preço indisponível', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [catalogAsset()], pending: ['asset-itub4'] });
        renderSearch();

        expect(await screen.findByText('buscando preço…')).toBeInTheDocument();
        for (let attempt: number = 0; attempt < QUOTE_MAX_POLLS + 2; attempt += 1) {
            await act(async () => {
                await vi.advanceTimersByTimeAsync(QUOTE_POLL_MS);
            });
        }

        await waitFor(() => {
            expect(screen.getByText('preço indisponível')).toBeInTheDocument();
        });
        expect(api.quoteRequests).toHaveLength(QUOTE_MAX_POLLS);
    });

    it('mostra o preço assim que a cotação chega', async () => {
        mockAssetsApi({ assets: [catalogAsset()], quotes: [quote('asset-itub4', '37.80')] });
        renderSearch();

        expect(await screen.findByText('R$ 37,80')).toBeInTheDocument();
    });

    it('um ativo que não está nem nas cotações nem nos pendentes fica sem preço', async () => {
        mockAssetsApi({ assets: [catalogAsset()] });
        renderSearch();

        expect(await screen.findByText('preço indisponível')).toBeInTheDocument();
    });

    it('fundos: envia o CNPJ só com dígitos, mostra o aviso de previdência e a fonte', async () => {
        const fund: CatalogAsset = catalogAsset({
            id: 'asset-fund',
            symbol: '00000000000191',
            name: 'FUNDO ALFA',
            kind: 'fund',
            market: 'CVM',
            typeGroup: 'fundos',
            suggestedClassKey: null
        });
        const api: AssetsApi = mockAssetsApi({ assets: [fund] });
        renderWithProviders(<Controlled group="fundos" />);
        await screen.findByRole('option', { name: /00\.000\.000\/0001-91/ });

        fireEvent.change(screen.getByRole('searchbox'), { target: { value: '00.000.000/0001-91' } });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        await waitFor(() => {
            expect(api.searches).toEqual(['fundos|', 'fundos|00000000000191']);
        });
        expect(screen.getByText(/Planos de previdência PGBL e VGBL não são cobertos/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'CVM, Portal de Dados Abertos' })).toBeInTheDocument();
    });

    it('espera o intervalo sem digitar antes de procurar', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [catalogAsset()] });
        renderWithProviders(<Controlled />);
        await screen.findByRole('option', { name: /ITUB4/ });

        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ita' } });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(150);
        });
        expect(api.searches).toEqual(['acoes_br|']);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(150);
        });

        await waitFor(() => {
            expect(api.searches).toEqual(['acoes_br|', 'acoes_br|ita']);
        });
    });
});

function Controlled({ group = 'acoes_br' }: { readonly group?: CatalogGroup }): React.ReactElement {
    const [query, setQuery] = React.useState<string>('');
    return (
        <AssetSearch
            group={group}
            typeName="Ações brasileiras"
            query={query}
            onQueryChange={setQuery}
            pickedId={null}
            heldAssetIds={new Set<string>()}
            classes={defaultClasses().data}
            onPick={vi.fn()}
        />
    );
}
