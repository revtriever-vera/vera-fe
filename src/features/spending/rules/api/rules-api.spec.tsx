import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor, type RenderHookResult } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { ApiError } from '@/shared/lib/api/api-error';
import { installRulesApi, type RulesApi, problemBody } from '../../../../../test/helpers/rules-api';
import { server } from '../../../../../test/msw/server';
import { createQueryWrapper, type QueryWrapper } from '../../../../../test/render';
import { spendingKeys } from '../../api/spending-keys';
import { useCreateCategory } from './use-create-category.mutation';
import { useCreateRule } from './use-create-rule.mutation';
import { useDeleteCategory } from './use-delete-category.mutation';
import { useDeleteRule } from './use-delete-rule.mutation';
import { useRulePreview } from './use-rule-preview.query';
import { useRules } from './use-rules.query';
import { useUpdateCategory } from './use-update-category.mutation';
import { useUpdateRule } from './use-update-rule.mutation';

type Hook<F extends (...args: never[]) => unknown> = RenderHookResult<ReturnType<F>, unknown>;

describe('hooks de regras e categorias', () => {
    it('useRules lê a lista sob a chave certa', async () => {
        installRulesApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useRules(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data?.rules).toHaveLength(2);
        expect(client.getQueryData(spendingKeys.rules())).toBeDefined();
    });

    it('useRulePreview fica parado sem entrada e consulta quando ela chega', async () => {
        const api: RulesApi = installRulesApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const idle: Hook<typeof useRulePreview> = renderHook(() => useRulePreview(null), { wrapper });
        const active: Hook<typeof useRulePreview> = renderHook(
            () => useRulePreview({ matchType: 'contains', pattern: 'abc', appliesTo: 'out' }),
            { wrapper }
        );

        await waitFor(() => {
            expect(active.result.current.data).toEqual({ normalizedPattern: 'ABC', matches: 1 });
        });

        expect(idle.result.current.fetchStatus).toBe('idle');
        expect(api.previews).toHaveLength(1);
    });

    it('as mutações de regra enviam o corpo e invalidam regras, categorias e o resumo', async () => {
        const api: RulesApi = installRulesApi();
        const { client, wrapper }: QueryWrapper = createQueryWrapper();
        client.setQueryData(spendingKeys.rules(), { rules: [] });
        client.setQueryData(spendingKeys.summary('2026-10'), {});
        const create: Hook<typeof useCreateRule> = renderHook(() => useCreateRule(), { wrapper });
        const update: Hook<typeof useUpdateRule> = renderHook(() => useUpdateRule(), { wrapper });
        const remove: Hook<typeof useDeleteRule> = renderHook(() => useDeleteRule(), { wrapper });

        await act(async () => {
            await create.result.current.mutateAsync({
                matchType: 'contains',
                pattern: 'abc',
                appliesTo: 'out',
                categoryId: 'c',
                applyToPast: false
            });
            await update.result.current.mutateAsync({ id: 'rule-maria', body: { categoryId: 'c2' } });
            await remove.result.current.mutateAsync('rule-maria');
        });

        expect(api.createdRules).toHaveLength(1);
        expect(api.rulePatches).toEqual([{ id: 'rule-maria', body: { categoryId: 'c2' } }]);
        expect(api.deletedRules).toEqual(['rule-maria']);
        expect(client.getQueryState(spendingKeys.rules())?.isInvalidated).toBe(true);
        expect(client.getQueryState(spendingKeys.summary('2026-10'))?.isInvalidated).toBe(true);
    });

    it('as mutações de categoria enviam o corpo e o moveTo só quando existe', async () => {
        const api: RulesApi = installRulesApi();
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const create: Hook<typeof useCreateCategory> = renderHook(() => useCreateCategory(), { wrapper });
        const update: Hook<typeof useUpdateCategory> = renderHook(() => useUpdateCategory(), { wrapper });
        const remove: Hook<typeof useDeleteCategory> = renderHook(() => useDeleteCategory(), { wrapper });

        await act(async () => {
            await create.result.current.mutateAsync({ name: 'Pets', kind: 'expense', flexibility: 'flexible', icon: 'PawPrint' });
            await update.result.current.mutateAsync({ id: 'cat-pets', body: { name: null } });
            await remove.result.current.mutateAsync({ id: 'cat-pets', moveTo: 'cat-x' });
            await remove.result.current.mutateAsync({ id: 'cat-new', moveTo: null });
        });

        expect(api.createdCategories).toHaveLength(1);
        expect(api.categoryPatches).toEqual([{ id: 'cat-pets', body: { name: null } }]);
        expect(api.deletedCategories).toEqual([
            { id: 'cat-pets', moveTo: 'cat-x' },
            { id: 'cat-new', moveTo: null }
        ]);
    });

    it('devolve o ApiError do problema, com o meta do conflito', async () => {
        server.use(
            http.post('*/spending/rules', () =>
                HttpResponse.json(problemBody('categories.rule_conflict', 409, { ruleId: 'r1' }), { status: 409 })
            )
        );
        const { wrapper }: QueryWrapper = createQueryWrapper();
        const { result } = renderHook(() => useCreateRule(), { wrapper });

        await act(async () => {
            await result.current
                .mutateAsync({ matchType: 'contains', pattern: 'abc', appliesTo: 'out', categoryId: 'c', applyToPast: true })
                .catch(() => undefined);
        });

        expect(result.current.error).toBeInstanceOf(ApiError);
        expect((result.current.error as ApiError).problem.meta).toEqual({ ruleId: 'r1' });
    });
});
