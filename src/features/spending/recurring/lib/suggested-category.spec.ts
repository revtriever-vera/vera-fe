import type { CategoryView } from '../../types';
import type { RecurringSeriesView } from '../types';
import { describe, expect, it } from 'vitest';
import { defaultCategories, systemCategory } from '../../../../../test/fixtures/spending';
import { recurringSeries } from '../../../../../test/fixtures/recurring';
import { isSubscriptionLike, suggestedCategoryId } from './suggested-category';

const CATEGORIES: readonly CategoryView[] = defaultCategories().categories;

describe('suggestedCategoryId', () => {
    it('propõe Assinaturas para um estabelecimento conhecido', () => {
        expect(suggestedCategoryId(recurringSeries(), CATEGORIES)).toBe(systemCategory('subscriptions').id);
    });

    it('propõe Assinaturas para série mensal de valor fixo', () => {
        const series: RecurringSeriesView = recurringSeries({ knownSubscription: false });

        expect(isSubscriptionLike(series)).toBe(true);
        expect(suggestedCategoryId(series, CATEGORIES)).toBe(systemCategory('subscriptions').id);
    });

    it('não propõe nada para valor variável ou cadência curta', () => {
        expect(suggestedCategoryId(recurringSeries({ knownSubscription: false, valueMode: 'variable' }), CATEGORIES)).toBe('');
        expect(suggestedCategoryId(recurringSeries({ knownSubscription: false, cadence: 'weekly' }), CATEGORIES)).toBe('');
    });

    it('devolve vazio sem categorias carregadas', () => {
        expect(suggestedCategoryId(recurringSeries(), [])).toBe('');
    });
});
