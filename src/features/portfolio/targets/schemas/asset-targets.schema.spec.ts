import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import type { ZodType } from 'zod';
import { createAssetTargetsSchema, isValidAssetTargetsSum, type AssetTargetsFormValues } from './asset-targets.schema';

const t: TFunction<'portfolioTargets'> = ((key: string): string => `tr:${key}`) as unknown as TFunction<'portfolioTargets'>;

function values(...bps: number[]): AssetTargetsFormValues {
    return {
        targets: bps.map((targetBps: number, index: number) => ({ subjectType: 'position', subjectId: `id-${String(index)}`, targetBps }))
    };
}

describe('createAssetTargetsSchema', () => {
    const schema: ZodType<AssetTargetsFormValues> = createAssetTargetsSchema(t);

    it('aceita soma 100%', () => {
        expect(schema.safeParse(values(3000, 4000, 3000)).success).toBe(true);
    });

    it('aceita tudo zero', () => {
        expect(schema.safeParse(values(0, 0, 0)).success).toBe(true);
    });

    it('recusa soma diferente com a mensagem traduzida', () => {
        const result: ReturnType<typeof schema.safeParse> = schema.safeParse(values(3000, 4000, 2000));
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe('tr:classDetail.errors.sumMustBe100');
    });

    it('recusa negativo, acima de 10000, fracionário e vazio', () => {
        expect(schema.safeParse(values(-1, 10001)).success).toBe(false);
        expect(schema.safeParse(values(10001)).success).toBe(false);
        expect(schema.safeParse(values(5000.5, 5000)).success).toBe(false);
        expect(schema.safeParse(values(Number.NaN, 10000)).success).toBe(false);
    });

    it('isValidAssetTargetsSum aceita só 0 ou 10000', () => {
        expect([0, 10000, 9999, 10001].map(isValidAssetTargetsSum)).toEqual([true, true, false, false]);
    });
});
