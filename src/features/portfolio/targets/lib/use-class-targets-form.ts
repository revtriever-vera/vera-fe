import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch, type FieldArrayWithId, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { ZodType } from 'zod';
import type { AssetClassView } from '../../types';
import {
    createClassTargetsSchema,
    FULL_TARGET_BPS,
    type ClassTargetValue,
    type ClassTargetsFormValues
} from '../schemas/class-targets.schema';
import { hasUnsavedChanges, mergeDrafts, sumTargets, toFormValues } from './targets-form';

export interface ClassTargetsFormState {
    readonly form: UseFormReturn<ClassTargetsFormValues>;
    readonly fields: ReadonlyArray<FieldArrayWithId<ClassTargetsFormValues, 'targets'>>;
    readonly sum: number;
    readonly dirty: boolean;
    readonly canSave: boolean;
}

function useSavedSync(form: UseFormReturn<ClassTargetsFormValues>, classes: readonly AssetClassView[]): void {
    const previous: RefObject<readonly AssetClassView[]> = useRef<readonly AssetClassView[]>(classes);
    useEffect((): void => {
        if (previous.current !== classes) {
            form.reset(mergeDrafts(form.getValues(), previous.current, classes));
            previous.current = classes;
        }
    }, [classes, form]);
}

function allFinite(values: ClassTargetsFormValues): boolean {
    return values.targets.every((item: ClassTargetValue): boolean => Number.isFinite(item.targetBps));
}

export function useClassTargetsForm(classes: readonly AssetClassView[]): ClassTargetsFormState {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const schema: ZodType<ClassTargetsFormValues> = useMemo((): ZodType<ClassTargetsFormValues> => createClassTargetsSchema(t), [t]);
    const form: UseFormReturn<ClassTargetsFormValues> = useForm<ClassTargetsFormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: toFormValues(classes)
    });
    const { fields } = useFieldArray({ control: form.control, name: 'targets' });
    useSavedSync(form, classes);
    const values: ClassTargetsFormValues = useWatch({ control: form.control }) as ClassTargetsFormValues;
    const sum: number = sumTargets(values);
    const dirty: boolean = hasUnsavedChanges(values, classes);
    return { form, fields, sum, dirty, canSave: dirty && sum === FULL_TARGET_BPS && allFinite(values) };
}
