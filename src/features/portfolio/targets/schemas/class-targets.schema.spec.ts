import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import type { ZodType, SafeParseReturnType } from 'zod';
import { createClassTargetsSchema, type ClassTargetsFormValues } from './class-targets.schema';

function targets(values: readonly number[]): { targets: { classId: string; targetBps: number }[] } {
    return { targets: values.map((targetBps: number, index: number) => ({ classId: `c${String(index)}`, targetBps })) };
}

describe('createClassTargetsSchema', () => {
    const t: TFunction<'portfolioTargets'> = i18n.getFixedT('pt-BR', 'portfolioTargets');
    const schema: ZodType<ClassTargetsFormValues> = createClassTargetsSchema(t);

    it('aceita metas que somam 10000', () => {
        expect(schema.safeParse(targets([2000, 800, 1200, 1500, 700, 2500, 800, 500])).success).toBe(true);
    });

    it.each([9900, 10100])('rejeita a soma %i com a mensagem traduzida', (sum: number) => {
        const result: SafeParseReturnType<unknown, ClassTargetsFormValues> = schema.safeParse(targets([sum - 5000, 5000]));

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('As metas precisam somar exatamente 100%.');
    });

    it.each([[[-100, 10100]], [[10100, -100]], [[5000.5, 5000.5]], [[Number.NaN, 10000]]])(
        'rejeita valor inválido %j',
        (values: number[]) => {
            const result: SafeParseReturnType<unknown, ClassTargetsFormValues> = schema.safeParse(targets(values));

            expect(result.success).toBe(false);
            expect(result.error?.issues.map((issue) => issue.message)).toContain('Informe um valor entre 0% e 100%.');
        }
    );
});
