import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { portfolioKeys } from '../../api/portfolio-keys';
import { BITCOIN, catalogAsset, exchangeRate, positionView, previewResult, quote } from '../../../../../test/fixtures/assets';
import { mockAssetsApi, type AssetsApi } from '../../../../../test/helpers/assets-api';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { QUOTE_MAX_POLLS, QUOTE_POLL_MS, quotePollInterval, useQuotes } from './use-quotes.query';
import { useCatalogSearch } from './use-catalog-search.query';
import { useExchangeRate } from './use-exchange-rate.query';
import { useFixedIncomePreview } from './use-fixed-income-preview.query';
import { usePosition } from './use-position.query';
import type { FixedIncomePreviewBody } from '../types';

describe('quotePollInterval', () => {
    it('repete a consulta enquanto houver pendentes e tentativas', () => {
        expect(quotePollInterval(1, 2)).toBe(QUOTE_POLL_MS);
        expect(quotePollInterval(QUOTE_MAX_POLLS - 1, 1)).toBe(QUOTE_POLL_MS);
    });

    it('para sem pendentes ou depois do limite', () => {
        expect(quotePollInterval(1, 0)).toBe(false);
        expect(quotePollInterval(QUOTE_MAX_POLLS, 1)).toBe(false);
    });
});

describe('useCatalogSearch', () => {
    it('busca no grupo com o texto e devolve os ativos', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [catalogAsset(), BITCOIN] });
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useCatalogSearch({ group: 'acoes_br', q: 'itub' }), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.data.map((asset) => asset.symbol)).toEqual(['ITUB4']);
        expect(api.searches).toEqual(['acoes_br|itub']);
        expect(client.getQueryData(portfolioKeys.catalogSearch({ group: 'acoes_br', q: 'itub' }))).toBeDefined();
    });

    it('omite q quando vazio para trazer os populares', async () => {
        const api: AssetsApi = mockAssetsApi({ assets: [catalogAsset()] });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useCatalogSearch({ group: 'acoes_br', q: '' }), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(api.searches).toEqual(['acoes_br|']);
    });
});

describe('useQuotes', () => {
    it('faz uma só chamada em lote com os ids ordenados e separados por vírgula', async () => {
        const api: AssetsApi = mockAssetsApi({ quotes: [quote('b', '10'), quote('a', '20')] });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useQuotes(['b', 'a']), { wrapper });

        await waitFor(() => {
            expect(result.current.quotes.size).toBe(2);
        });

        expect(api.quoteRequests).toEqual(['a,b']);
        expect(result.current.quotes.get('a')?.price).toBe('20');
        expect(result.current.exhausted).toBe(false);
    });

    it('não consulta sem ids', () => {
        const api: AssetsApi = mockAssetsApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useQuotes([]), { wrapper });

        expect(result.current.quotes.size).toBe(0);
        expect(api.quoteRequests).toEqual([]);
    });

    describe('com pendentes', () => {
        beforeEach(() => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('repete a cada 2,5 s por até 10 tentativas e depois desiste', async () => {
            const api: AssetsApi = mockAssetsApi({ pending: ['a'] });
            const { wrapper }: QueryWrapper = createQueryWrapper();
            const { result } = renderHook(() => useQuotes(['a']), { wrapper });

            await waitFor(() => {
                expect(result.current.pending.has('a')).toBe(true);
            });
            for (let attempt: number = 0; attempt < QUOTE_MAX_POLLS + 3; attempt += 1) {
                await act(async () => {
                    await vi.advanceTimersByTimeAsync(QUOTE_POLL_MS);
                });
            }

            expect(api.quoteRequests).toHaveLength(QUOTE_MAX_POLLS);
            expect(result.current.exhausted).toBe(true);
        });

        it('para de repetir quando a cotação chega', async () => {
            const api: AssetsApi = mockAssetsApi({ pending: ['a'] });
            const { wrapper }: QueryWrapper = createQueryWrapper();
            const { result } = renderHook(() => useQuotes(['a']), { wrapper });
            await waitFor(() => {
                expect(result.current.pending.has('a')).toBe(true);
            });
            server.use(http.get('*/market-data/quotes', () => HttpResponse.json({ quotes: [quote('a', '9')], pendingAssetIds: [] })));

            await act(async () => {
                await vi.advanceTimersByTimeAsync(QUOTE_POLL_MS);
            });
            await waitFor(() => {
                expect(result.current.quotes.get('a')?.price).toBe('9');
            });
            const calls: number = api.quoteRequests.length;
            await act(async () => {
                await vi.advanceTimersByTimeAsync(QUOTE_POLL_MS * 3);
            });

            expect(api.quoteRequests).toHaveLength(calls);
        });
    });
});

describe('useExchangeRate', () => {
    it('lê o câmbio da moeda quando habilitado', async () => {
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useExchangeRate('USD', true), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(exchangeRate());
    });

    it('não consulta quando desabilitado', () => {
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useExchangeRate('USD', false), { wrapper });

        expect(result.current.fetchStatus).toBe('idle');
    });
});

describe('useFixedIncomePreview', () => {
    const BODY: FixedIncomePreviewBody = {
        kind: 'cdb',
        indexer: 'cdi_percent',
        rateBps: 11000,
        currency: 'BRL',
        appliedMinor: 5000000,
        appliedAt: '2025-03-10',
        maturityDate: '2028-03-10'
    };

    it('envia o corpo e devolve a prévia calculada pela API', async () => {
        const api: AssetsApi = mockAssetsApi({ preview: previewResult({ valueMinor: 7000000 }) });
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useFixedIncomePreview(BODY), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.valueMinor).toBe(7000000);
        expect(api.previewBodies).toEqual([BODY]);
    });

    it('não consulta sem corpo', () => {
        const api: AssetsApi = mockAssetsApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useFixedIncomePreview(null), { wrapper });

        expect(result.current.fetchStatus).toBe('idle');
        expect(api.previewBodies).toEqual([]);
    });
});

describe('usePosition', () => {
    it('lê a posição pelo id', async () => {
        mockAssetsApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => usePosition('position-itub4'), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(positionView());
        expect(client.getQueryData(portfolioKeys.position('position-itub4'))).toBeDefined();
    });
});
