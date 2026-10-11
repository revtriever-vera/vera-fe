import { useMemo, useState } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useCreatePosition } from '../api/use-create-position.mutation';
import { createPositionSchema, type PositionFormInput } from '../schemas/position.schema';
import type { CatalogAsset, CreatePositionBody, PositionView } from '../types';
import { positionDefaults } from './position-defaults';
import { normalizeDecimalInput } from './quantity-decimals';
import { useFailureReporter } from './use-failure-reporter';

export interface PositionFormParams {
    readonly classes: readonly AssetClassView[];
    readonly initialClassId: string | undefined;
    readonly asset: CatalogAsset | null;
    readonly onSaved: () => void;
    readonly onDuplicate: (positionId: string) => void;
}

export interface PositionFormState {
    readonly form: UseFormReturn<PositionFormInput>;
    readonly canSubmit: boolean;
    readonly busy: boolean;
    readonly alertMessage: string | null;
    readonly submit: () => Promise<void>;
    readonly select: (asset: CatalogAsset) => void;
}

export function toPositionBody(asset: CatalogAsset, input: PositionFormInput): CreatePositionBody {
    const averagePrice: string = normalizeDecimalInput(input.averagePrice);
    return {
        assetId: asset.id,
        quantity: input.quantity,
        classId: input.classId,
        ...(averagePrice === '' ? {} : { averagePrice })
    };
}

function classNameOf(classes: readonly AssetClassView[], classId: string, classLabel: ClassLabel): string {
    const chosen: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === classId);
    return chosen === undefined ? '' : classLabel(chosen.systemKey, chosen.name);
}

interface SubmitParams {
    readonly form: UseFormReturn<PositionFormInput>;
    readonly asset: CatalogAsset | null;
    readonly classes: readonly AssetClassView[];
    readonly onSaved: () => void;
    readonly onDuplicate: (positionId: string) => void;
    readonly setAlertMessage: (message: string | null) => void;
}

function usePositionFailure({
    form,
    onDuplicate,
    setAlertMessage
}: Pick<SubmitParams, 'form' | 'onDuplicate' | 'setAlertMessage'>): (error: Error) => void {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const toast: ToastApi = useToast();
    return useFailureReporter(
        {
            onQuantity: (message: string): void => {
                form.setError('quantity', { type: 'server', message });
                form.setFocus('quantity');
            },
            onClass: (message: string): void => {
                form.setError('classId', { type: 'server', message });
            },
            onDuplicate: (positionId: string): void => {
                toast.show({ tone: 'neutral', title: t('toasts.duplicate') });
                onDuplicate(positionId);
            },
            onAlert: setAlertMessage
        },
        t('toasts.addFailed')
    );
}

function usePositionSubmit(params: SubmitParams): { submit: () => Promise<void>; busy: boolean } {
    const { form, asset, classes, onSaved, setAlertMessage }: SubmitParams = params;
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const toast: ToastApi = useToast();
    const classLabel: ClassLabel = useClassLabel();
    const create: UseMutationResult<PositionView, ApiError, CreatePositionBody> = useCreatePosition();
    const report: (error: Error) => void = usePositionFailure(params);
    const submit: () => Promise<void> = form.handleSubmit(async (input: PositionFormInput): Promise<void> => {
        if (asset === null) {
            return;
        }
        setAlertMessage(null);
        try {
            await create.mutateAsync(toPositionBody(asset, input));
            const className: string = classNameOf(classes, input.classId, classLabel);
            toast.show({ tone: 'positive', title: t('toasts.added', { name: asset.symbol, className }) });
            onSaved();
        } catch (error) {
            report(error as Error);
        }
    });
    return { submit, busy: create.isPending };
}

export function usePositionForm({ classes, initialClassId, asset, onSaved, onDuplicate }: PositionFormParams): PositionFormState {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const decimals: number = asset?.quantityDecimals ?? 0;
    const schema: z.ZodType<PositionFormInput> = useMemo(
        (): z.ZodType<PositionFormInput> => createPositionSchema(t, decimals),
        [t, decimals]
    );
    const form: UseFormReturn<PositionFormInput> = useForm<PositionFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: positionDefaults(classes, null, initialClassId)
    });
    const values: PositionFormInput = useWatch({ control: form.control }) as PositionFormInput;
    const { submit, busy } = usePositionSubmit({ form, asset, classes, onSaved, onDuplicate, setAlertMessage });
    return {
        form,
        canSubmit: asset !== null && schema.safeParse(values).success,
        busy,
        alertMessage,
        submit,
        select: (next: CatalogAsset): void => {
            setAlertMessage(null);
            form.reset(positionDefaults(classes, next, initialClassId));
        }
    };
}
