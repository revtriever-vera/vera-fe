import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { server } from '../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../test/render';
import { canonicalAccounts, spendingSettings } from '../../../../test/fixtures/spending';
import { spendingKeys } from './spending-keys';
import { useAccounts } from './use-accounts.query';
import { useCategories } from './use-categories.query';
import { useSpendingSettings } from './use-spending-settings.query';
import { useUncategorizedCount } from './use-uncategorized-count.query';

const PROBLEM: object = { type: 'validation_failed', title: 'x', status: 403, detail: 'denied', requestId: null };

describe('hooks de leitura dos gastos', () => {
    it('useCategories devolve as 17 categorias padrão sob a chave certa', async () => {
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useCategories(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.categories).toHaveLength(17);
        expect(client.getQueryData(spendingKeys.categories())).toBeDefined();
    });

    it('useAccounts devolve as contas', async () => {
        server.use(http.get('*/spending/accounts', () => HttpResponse.json(canonicalAccounts())));
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useAccounts(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.accounts.map((account): string => account.name)).toEqual([
            'Nubank Cartão',
            'Nubank Conta',
            'Itaú Conta'
        ]);
        expect(client.getQueryData(spendingKeys.accounts())).toBeDefined();
    });

    it('useUncategorizedCount devolve o contador', async () => {
        server.use(http.get('*/spending/transactions/uncategorized-count', () => HttpResponse.json({ count: 3 })));
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useUncategorizedCount(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual({ count: 3 });
        expect(client.getQueryData(spendingKeys.uncategorizedCount())).toEqual({ count: 3 });
    });

    it('useUncategorizedCount não busca quando desligado', () => {
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useUncategorizedCount({ enabled: false }), { wrapper });

        expect(result.current.fetchStatus).toBe('idle');
    });

    it('useSpendingSettings devolve as configurações padrão', async () => {
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useSpendingSettings(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(spendingSettings());
        expect(client.getQueryData(spendingKeys.settings())).toBeDefined();
    });

    it('expõe o ApiError quando a leitura falha', async () => {
        server.use(http.get('*/spending/categories', () => HttpResponse.json(PROBLEM, { status: 403 })));
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useCategories(), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
    });
});
