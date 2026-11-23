import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { createEditSeriesSchema, toUpdateBody, type EditSeriesFormInput } from './edit-series.schema';

const t: TFunction<'spendingRecurring'> = i18n.getFixedT('pt-BR', 'spendingRecurring');
const VALID: EditSeriesFormInput = { name: ' Enel ', cadence: 'monthly', expectedDay: '8', valueMode: 'variable', kind: 'bill' };

describe('edit-series schema', () => {
    it('aceita a série editada e monta o corpo do PATCH', () => {
        const parsed: EditSeriesFormInput = createEditSeriesSchema(t).parse(VALID);

        expect(toUpdateBody(parsed)).toEqual({ name: 'Enel', cadence: 'monthly', expectedDay: 8, valueMode: 'variable', kind: 'bill' });
    });

    it('manda o dia nulo na cadência semanal', () => {
        const parsed: EditSeriesFormInput = createEditSeriesSchema(t).parse({ ...VALID, cadence: 'weekly', expectedDay: '' });

        expect(toUpdateBody(parsed).expectedDay).toBeNull();
    });

    it('recusa nome vazio e dia fora de 1 a 31', () => {
        const result: ReturnType<ReturnType<typeof createEditSeriesSchema>['safeParse']> = createEditSeriesSchema(t).safeParse({
            ...VALID,
            name: ' ',
            expectedDay: '40'
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.message)).toEqual(['Informe o nome', 'Informe um dia de 1 a 31']);
    });
});
