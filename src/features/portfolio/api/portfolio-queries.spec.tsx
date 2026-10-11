import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { server } from '../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../test/render';
import { sampleHoldings, sampleOverview, defaultClasses } from '../../../../test/fixtures/portfolio';
import { portfolioKeys } from './portfolio-keys';
import { useClasses } from './use-classes.query';
import { useHoldings } from './use-holdings.query';
import { useOverview } from './use-overview.query';
import { usePortfolioSettings } from './use-portfolio-settings.query';

const PROBLEM: object = { type: 'auth.unauthorized', title: 'x', status: 403, detail: 'denied', requestId: null };

describe('hooks de leitura do patrimônio', () => {
    it('useHoldings devolve a carteira e guarda sob a chave certa', async () => {
        server.use(http.get('*/portfolio/holdings', () => HttpResponse.json(sampleHoldings())));
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useHoldings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.data).toHaveLength(19);
        expect(client.getQueryData(portfolioKeys.holdings())).toBeDefined();
    });

    it('useOverview devolve a visão geral', async () => {
        server.use(http.get('*/portfolio/overview', () => HttpResponse.json(sampleOverview())));
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useOverview(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.totalMinor).toBe(177310040);
        expect(client.getQueryData(portfolioKeys.overview())).toBeDefined();
    });

    it('useClasses devolve as classes padrão', async () => {
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useClasses(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(defaultClasses());
        expect(client.getQueryData(portfolioKeys.classes())).toBeDefined();
    });

    it('usePortfolioSettings devolve BRL e 5 pp por padrão', async () => {
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => usePortfolioSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual({ baseCurrency: 'BRL', toleranceBps: 500 });
        expect(client.getQueryData(portfolioKeys.settings())).toBeDefined();
    });

    it.each([
        ['/portfolio/holdings', useHoldings],
        ['/portfolio/overview', useOverview],
        ['/allocation/classes', useClasses],
        ['/allocation/settings', usePortfolioSettings]
    ])('%s expõe o ApiError quando a API recusa', async (path: string, useHook: () => { isError: boolean; error: Error | null }) => {
        server.use(http.get(`*${path}`, () => HttpResponse.json(PROBLEM, { status: 403 })));
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useHook(), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
    });
});
