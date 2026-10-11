import { describe, expectTypeOf, it } from 'vitest';
import type { CategoryView, ConnectionView, CutsResponse, MonthlySummary, SpendingSettings, TransactionView } from './types';

describe('tipos dos gastos derivados do contrato', () => {
    it('a categoria carrega natureza, flexibilidade e ícone fechado', () => {
        expectTypeOf<CategoryView['kind']>().toEqualTypeOf<'expense' | 'income' | 'transfer'>();
        expectTypeOf<CategoryView['flexibility']>().toEqualTypeOf<'fixed' | 'flexible' | null>();
        expectTypeOf<'Home'>().toExtend<CategoryView['icon']>();
        expectTypeOf<'Rocket'>().not.toExtend<CategoryView['icon']>();
    });

    it('a transação carrega a origem da categoria', () => {
        expectTypeOf<TransactionView['categorySource']>().toEqualTypeOf<'user' | 'rule' | 'dictionary' | 'provider' | 'none'>();
        expectTypeOf<TransactionView['amountMinor']>().toBeNumber();
    });

    it('o resumo, as configurações e os cortes têm os campos do contrato', () => {
        expectTypeOf<MonthlySummary['income']['mode']>().toEqualTypeOf<'transactions' | 'declared'>();
        expectTypeOf<SpendingSettings['declaredIncomeMinor']>().toEqualTypeOf<number | null>();
        expectTypeOf<CutsResponse['status']>().toEqualTypeOf<'no_data' | 'no_income' | 'goal_met' | 'cut_suggested' | 'exceeds_flexible'>();
    });

    it('a conexão tem o estado do vínculo', () => {
        expectTypeOf<ConnectionView['status']>().toEqualTypeOf<'active' | 'needs_attention' | 'revoked' | 'paused'>();
    });
});
