import type { TFunction } from 'i18next';
import { z } from 'zod';
import type { ZodType } from 'zod';
import type { AssetSubjectType } from '../types';

export const FULL_ASSET_TARGET_BPS: number = 10000;

export interface AssetTargetValue {
    readonly subjectType: AssetSubjectType;
    readonly subjectId: string;
    readonly targetBps: number;
}

export interface AssetTargetsFormValues {
    readonly targets: ReadonlyArray<AssetTargetValue>;
}

function sumOf(values: AssetTargetsFormValues): number {
    return values.targets.reduce((sum: number, item: AssetTargetValue): number => sum + item.targetBps, 0);
}

export function isValidAssetTargetsSum(sumBps: number): boolean {
    return sumBps === 0 || sumBps === FULL_ASSET_TARGET_BPS;
}

export function createAssetTargetsSchema(t: TFunction<'portfolioTargets'>): ZodType<AssetTargetsFormValues> {
    const targetBps = z
        .number({ invalid_type_error: t('classDetail.errors.invalid'), required_error: t('classDetail.errors.invalid') })
        .int(t('classDetail.errors.invalid'))
        .min(0, t('classDetail.errors.invalid'))
        .max(FULL_ASSET_TARGET_BPS, t('classDetail.errors.invalid'));
    return z
        .object({
            targets: z.array(z.object({ subjectType: z.enum(['position', 'fixed_income']), subjectId: z.string(), targetBps }))
        })
        .superRefine((values: AssetTargetsFormValues, context: z.RefinementCtx): void => {
            if (!isValidAssetTargetsSum(sumOf(values))) {
                context.addIssue({ code: z.ZodIssueCode.custom, path: ['targets'], message: t('classDetail.errors.sumMustBe100') });
            }
        });
}
