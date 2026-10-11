import type { TFunction } from 'i18next';
import { z } from 'zod';
import type { ZodType } from 'zod';

export const FULL_TARGET_BPS: number = 10000;

export interface ClassTargetValue {
    readonly classId: string;
    readonly targetBps: number;
}

export interface ClassTargetsFormValues {
    readonly targets: ReadonlyArray<ClassTargetValue>;
}

function sumOf(values: ClassTargetsFormValues): number {
    return values.targets.reduce((sum: number, item: ClassTargetValue): number => sum + item.targetBps, 0);
}

export function createClassTargetsSchema(t: TFunction<'portfolioTargets'>): ZodType<ClassTargetsFormValues> {
    const targetBps = z
        .number({ invalid_type_error: t('targets.errors.invalid'), required_error: t('targets.errors.invalid') })
        .int(t('targets.errors.invalid'))
        .min(0, t('targets.errors.invalid'))
        .max(FULL_TARGET_BPS, t('targets.errors.invalid'));
    return z
        .object({
            targets: z.array(z.object({ classId: z.string(), targetBps }))
        })
        .superRefine((values: ClassTargetsFormValues, context: z.RefinementCtx): void => {
            if (sumOf(values) !== FULL_TARGET_BPS) {
                context.addIssue({ code: z.ZodIssueCode.custom, path: ['targets'], message: t('targets.errors.sumMustBe100') });
            }
        });
}
