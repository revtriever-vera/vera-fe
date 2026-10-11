import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type FieldArrayWithId, type UseFieldArrayReplace, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { ZodType } from 'zod';
import { createAssetTargetsSchema, isValidAssetTargetsSum, type AssetTargetsFormValues } from '../schemas/asset-targets.schema';
import type { ClassDetail, ClassDetailAsset } from '../types';
import { canSaveAssetTargets, hasUnsavedAssetChanges, mergeAssetDrafts, sumAssetTargets, toAssetFormValues } from './asset-targets-form';

export interface AssetTargetsFormState {
    readonly form: UseFormReturn<AssetTargetsFormValues>;
    readonly fields: ReadonlyArray<FieldArrayWithId<AssetTargetsFormValues, 'targets'>>;
    readonly replace: UseFieldArrayReplace<AssetTargetsFormValues, 'targets'>;
    readonly sum: number;
    readonly dirty: boolean;
    readonly canSave: boolean;
    readonly equalSplitHint: boolean;
}

function useSavedSync(form: UseFormReturn<AssetTargetsFormValues>, assets: readonly ClassDetailAsset[]): void {
    const previous: RefObject<readonly ClassDetailAsset[]> = useRef<readonly ClassDetailAsset[]>(assets);
    useEffect((): void => {
        if (previous.current !== assets) {
            form.reset(mergeAssetDrafts(form.getValues(), previous.current, assets));
            previous.current = assets;
        }
    }, [assets, form]);
}

export function useAssetTargetsForm(detail: ClassDetail): AssetTargetsFormState {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const schema: ZodType<AssetTargetsFormValues> = useMemo((): ZodType<AssetTargetsFormValues> => createAssetTargetsSchema(t), [t]);
    const form: UseFormReturn<AssetTargetsFormValues> = useForm<AssetTargetsFormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: toAssetFormValues(detail.assets)
    });
    const { fields, replace } = useFieldArray({ control: form.control, name: 'targets' });
    useSavedSync(form, detail.assets);
    const values: AssetTargetsFormValues = useWatch({ control: form.control }) as AssetTargetsFormValues;
    const sum: number = sumAssetTargets(values);
    const dirty: boolean = hasUnsavedAssetChanges(values, detail.assets);
    const storedUnset: boolean = detail.targetsSumBps === 0;
    return {
        form,
        fields,
        replace,
        sum,
        dirty,
        canSave: canSaveAssetTargets(values, detail.assets, detail.targetsSumBps, isValidAssetTargetsSum(sum)),
        equalSplitHint: sum === 0 || (storedUnset && !dirty)
    };
}
