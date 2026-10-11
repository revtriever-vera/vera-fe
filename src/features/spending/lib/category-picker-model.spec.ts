import { describe, expect, it } from 'vitest';
import { defaultCategories, categoryView } from '../../../../test/fixtures/spending';
import {
    nextIndex,
    normalizeSearch,
    pickerGroups,
    selectableOptions,
    warningFor,
    type PickerGroup,
    type PickerInput,
    type PickerOption
} from './category-picker-model';

const LABELS: Readonly<Record<string, string>> = { groceries: 'Mercado', eating_out: 'Delivery e restaurantes', income: 'Renda' };

function input(overrides: Partial<PickerInput> = {}): PickerInput {
    return {
        categories: defaultCategories().categories,
        label: (category): string => category?.name ?? LABELS[category?.systemKey ?? ''] ?? category?.systemKey ?? '',
        query: '',
        direction: undefined,
        ...overrides
    };
}

describe('pickerGroups', () => {
    it('agrupa por natureza na ordem gastos, entradas e transferências', () => {
        const groups: readonly PickerGroup[] = pickerGroups(input(), null);

        expect(groups.map((group: PickerGroup): string | null => group.kind)).toEqual(['expense', 'income', 'transfer']);
        expect(groups[0]?.options).toHaveLength(12);
        expect(groups[1]?.options).toHaveLength(2);
        expect(groups[2]?.options).toHaveLength(3);
    });

    it('filtra pela busca sem diferenciar acento nem caixa', () => {
        const groups: readonly PickerGroup[] = pickerGroups(input({ query: 'DELIVERY' }), null);

        expect(groups).toHaveLength(1);
        expect(groups[0]?.options.map((option): string => option.label)).toEqual(['Delivery e restaurantes']);
    });

    it('inclui a opção sem categoria quando permitida e some se a busca não casa', () => {
        expect(pickerGroups(input(), 'Nenhuma categoria')[0]?.kind).toBeNull();
        expect(
            pickerGroups(input({ query: 'mercado' }), 'Nenhuma categoria').some((group: PickerGroup): boolean => group.kind === null)
        ).toBe(false);
    });

    it('usa o nome da categoria do usuário', () => {
        const groups: readonly PickerGroup[] = pickerGroups(
            input({ categories: [categoryView({ id: 'c-1', name: 'Pets', position: 0 })] }),
            null
        );

        expect(groups[0]?.options[0]?.label).toBe('Pets');
    });

    it('avisa sobre renda em saída e sobre gasto em entrada', () => {
        const out: readonly PickerGroup[] = pickerGroups(input({ direction: 'out' }), null);
        const incoming: readonly PickerGroup[] = pickerGroups(input({ direction: 'in' }), null);

        expect(out[1]?.options.every((option): boolean => option.warning === 'incomeInOutflow')).toBe(true);
        expect(out[0]?.options.every((option): boolean => option.warning === null)).toBe(true);
        expect(incoming[0]?.options.every((option): boolean => option.warning === 'expenseInInflow')).toBe(true);
    });
});

describe('selectableOptions', () => {
    it('deixa de fora as opções com aviso', () => {
        const options: readonly PickerOption[] = selectableOptions(pickerGroups(input({ direction: 'out' }), null));

        expect(options).toHaveLength(15);
        expect(options.every((option): boolean => option.warning === null)).toBe(true);
    });
});

describe('warningFor', () => {
    it('transferência vale nos dois sentidos', () => {
        expect(warningFor('transfer', 'out')).toBeNull();
        expect(warningFor('transfer', 'in')).toBeNull();
        expect(warningFor('income', undefined)).toBeNull();
    });
});

describe('normalizeSearch', () => {
    it('tira acentos, caixa e espaços das pontas', () => {
        expect(normalizeSearch('  Educação ')).toBe('educacao');
    });
});

describe('nextIndex', () => {
    it('dá a volta nas duas pontas', () => {
        expect(nextIndex(-1, 1, 3)).toBe(0);
        expect(nextIndex(-1, -1, 3)).toBe(2);
        expect(nextIndex(2, 1, 3)).toBe(0);
        expect(nextIndex(0, -1, 3)).toBe(2);
    });

    it('devolve -1 sem opções', () => {
        expect(nextIndex(0, 1, 0)).toBe(-1);
    });
});
