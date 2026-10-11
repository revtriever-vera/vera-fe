import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import {
    EMPTY_MAPPING_VALUES,
    createMappingSchema,
    toCsvMapping,
    toMappingFormValues,
    type CsvMapping,
    type MappingFormValues
} from './mapping.schema';

const t: TFunction<'spendingImports'> = i18n.getFixedT('pt-BR', 'spendingImports');
const tEn: TFunction<'spendingImports'> = i18n.getFixedT('en', 'spendingImports');

function values(overrides: Partial<MappingFormValues>): MappingFormValues {
    return { ...EMPTY_MAPPING_VALUES, dateColumn: '0', descriptionColumn: '1', amountColumn: '2', ...overrides };
}

function messages(input: MappingFormValues, translate: TFunction<'spendingImports'> = t): string[] {
    const result: ReturnType<ReturnType<typeof createMappingSchema>['safeParse']> = createMappingSchema(translate).safeParse(input);
    return result.success ? [] : result.error.issues.map((issue): string => `${issue.path.join('.')}: ${issue.message}`);
}

describe('createMappingSchema', () => {
    it('aceita uma coluna de valor', () => {
        expect(messages(values({}))).toEqual([]);
    });

    it('aceita débito e crédito sem a coluna de valor', () => {
        expect(messages(values({ amountMode: 'split', amountColumn: '', debitColumn: '2', creditColumn: '3' }))).toEqual([]);
    });

    it('uma coluna de valor não aceita o par em branco no modo dividido', () => {
        expect(messages(values({ amountMode: 'split', amountColumn: '2' }))).toEqual([
            'debitColumn: Escolha a coluna',
            'creditColumn: Escolha a coluna'
        ]);
    });

    it('no modo de uma coluna, ignora débito e crédito', () => {
        expect(messages(values({ debitColumn: '', creditColumn: '' }))).toEqual([]);
    });

    it('colunas repetidas são inválidas', () => {
        expect(messages(values({ descriptionColumn: '0', amountColumn: '0' }))).toEqual([
            'descriptionColumn: Esta coluna já está em uso em outro campo',
            'amountColumn: Esta coluna já está em uso em outro campo'
        ]);
    });

    it('coluna não escolhida pede a escolha', () => {
        expect(messages(values({ dateColumn: '' }))).toEqual(['dateColumn: Escolha a coluna']);
    });

    it('a mensagem sai no idioma ativo', () => {
        expect(messages(values({ dateColumn: '' }), tEn)).toEqual(['dateColumn: Choose the column']);
    });
});

describe('toCsvMapping e toMappingFormValues', () => {
    it('uma coluna de valor vira amountColumn', () => {
        expect(toCsvMapping(values({ invertSign: true, decimalSeparator: '.', dateFormat: 'yyyy-MM-dd', hasHeader: false }))).toEqual({
            hasHeader: false,
            dateColumn: 0,
            descriptionColumn: 1,
            amountColumn: 2,
            debitColumn: undefined,
            creditColumn: undefined,
            dateFormat: 'yyyy-MM-dd',
            decimalSeparator: '.',
            invertSign: true
        });
    });

    it('débito e crédito viram o par, sem amountColumn', () => {
        const mapping: CsvMapping = toCsvMapping(values({ amountMode: 'split', debitColumn: '3', creditColumn: '4' }));

        expect(mapping.amountColumn).toBeUndefined();
        expect(mapping.debitColumn).toBe(3);
        expect(mapping.creditColumn).toBe(4);
    });

    it('ida e volta preserva o modo', () => {
        const split: CsvMapping = toCsvMapping(values({ amountMode: 'split', debitColumn: '3', creditColumn: '4' }));
        const single: CsvMapping = toCsvMapping(values({}));

        expect(toMappingFormValues(split)).toMatchObject({ amountMode: 'split', debitColumn: '3', creditColumn: '4', amountColumn: '' });
        expect(toMappingFormValues(single)).toMatchObject({ amountMode: 'single', amountColumn: '2' });
    });
});
