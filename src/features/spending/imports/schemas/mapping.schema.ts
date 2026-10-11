import type { TFunction } from 'i18next';
import { z } from 'zod';

export const DATE_FORMATS = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yy'] as const;
export const DECIMAL_SEPARATORS = [',', '.'] as const;
export const AMOUNT_MODES = ['single', 'split'] as const;

export type DateFormat = (typeof DATE_FORMATS)[number];
export type DecimalSeparator = (typeof DECIMAL_SEPARATORS)[number];
export type AmountMode = (typeof AMOUNT_MODES)[number];
export type MappingColumnField = 'dateColumn' | 'descriptionColumn' | 'amountColumn' | 'debitColumn' | 'creditColumn';

const MAX_COLUMN_INDEX: number = 99;
const COLUMN_PATTERN: RegExp = /^\d+$/;

const columnIndex = z.number().int().min(0).max(MAX_COLUMN_INDEX);

export const csvMappingSchema = z.object({
    delimiter: z.enum([',', ';']).optional(),
    hasHeader: z.boolean(),
    dateColumn: columnIndex,
    descriptionColumn: columnIndex,
    amountColumn: columnIndex.optional(),
    debitColumn: columnIndex.optional(),
    creditColumn: columnIndex.optional(),
    dateFormat: z.enum(DATE_FORMATS),
    decimalSeparator: z.enum(DECIMAL_SEPARATORS),
    invertSign: z.boolean()
});

export type CsvMapping = z.infer<typeof csvMappingSchema>;

export interface MappingFormValues {
    hasHeader: boolean;
    amountMode: AmountMode;
    dateColumn: string;
    descriptionColumn: string;
    amountColumn: string;
    debitColumn: string;
    creditColumn: string;
    dateFormat: DateFormat;
    decimalSeparator: DecimalSeparator;
    invertSign: boolean;
}

export const EMPTY_MAPPING_VALUES: MappingFormValues = {
    hasHeader: true,
    amountMode: 'single',
    dateColumn: '',
    descriptionColumn: '',
    amountColumn: '',
    debitColumn: '',
    creditColumn: '',
    dateFormat: 'dd/MM/yyyy',
    decimalSeparator: ',',
    invertSign: false
};

function activeFields(mode: AmountMode): readonly MappingColumnField[] {
    return mode === 'single'
        ? ['dateColumn', 'descriptionColumn', 'amountColumn']
        : ['dateColumn', 'descriptionColumn', 'debitColumn', 'creditColumn'];
}

export function createMappingSchema(t: TFunction<'spendingImports'>): z.ZodType<MappingFormValues> {
    return z
        .object({
            hasHeader: z.boolean(),
            amountMode: z.enum(AMOUNT_MODES),
            dateColumn: z.string(),
            descriptionColumn: z.string(),
            amountColumn: z.string(),
            debitColumn: z.string(),
            creditColumn: z.string(),
            dateFormat: z.enum(DATE_FORMATS),
            decimalSeparator: z.enum(DECIMAL_SEPARATORS),
            invertSign: z.boolean()
        })
        .superRefine((values: MappingFormValues, context: z.RefinementCtx): void => {
            const seen: Set<string> = new Set();
            for (const field of activeFields(values.amountMode)) {
                const value: string = values[field];
                const filled: boolean = COLUMN_PATTERN.test(value);
                const message: string = filled ? t('mapping.errors.columnRepeated') : t('mapping.errors.columnRequired');
                if (!filled || seen.has(value)) {
                    context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
                }
                seen.add(value);
            }
        });
}

function optionalColumn(value: string): number | undefined {
    return COLUMN_PATTERN.test(value) ? Number(value) : undefined;
}

export function toCsvMapping(values: MappingFormValues): CsvMapping {
    const single: boolean = values.amountMode === 'single';
    return {
        hasHeader: values.hasHeader,
        dateColumn: Number(values.dateColumn),
        descriptionColumn: Number(values.descriptionColumn),
        amountColumn: single ? optionalColumn(values.amountColumn) : undefined,
        debitColumn: single ? undefined : optionalColumn(values.debitColumn),
        creditColumn: single ? undefined : optionalColumn(values.creditColumn),
        dateFormat: values.dateFormat,
        decimalSeparator: values.decimalSeparator,
        invertSign: values.invertSign
    };
}

export function toMappingFormValues(mapping: CsvMapping): MappingFormValues {
    const single: boolean = mapping.amountColumn !== undefined;
    return {
        hasHeader: mapping.hasHeader,
        amountMode: single ? 'single' : 'split',
        dateColumn: String(mapping.dateColumn),
        descriptionColumn: String(mapping.descriptionColumn),
        amountColumn: String(mapping.amountColumn ?? ''),
        debitColumn: String(mapping.debitColumn ?? ''),
        creditColumn: String(mapping.creditColumn ?? ''),
        dateFormat: mapping.dateFormat,
        decimalSeparator: mapping.decimalSeparator,
        invertSign: mapping.invertSign
    };
}
