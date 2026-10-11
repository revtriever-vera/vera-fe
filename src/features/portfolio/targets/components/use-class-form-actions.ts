import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { useCreateClass } from '../api/use-create-class.mutation';
import { useUpdateClass, type UpdateClassInput } from '../api/use-update-class.mutation';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import type { AssetClassView, CreateClassInput, UpdateClassBody } from '../../types';
import { classChanges } from '../lib/class-changes';
import type { ClassFormInput } from '../schemas/class.schema';

const NAME_TAKEN_CODE: string = 'allocation.class_name_taken';

export type ClassFormMode = { readonly kind: 'create' } | { readonly kind: 'edit'; readonly assetClass: AssetClassView };

export interface ClassFormActions {
    readonly save: (input: ClassFormInput) => Promise<void>;
    readonly restoreName: () => Promise<void>;
    readonly busy: boolean;
}

export interface ClassFormActionsParams {
    readonly mode: ClassFormMode;
    readonly initial: ClassFormInput;
    readonly form: UseFormReturn<ClassFormInput>;
    readonly onClose: () => void;
}

function useFailureReporter(form: UseFormReturn<ClassFormInput>): (error: Error) => void {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const { t: tp }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    return (error: Error): void => {
        if (error instanceof ApiError && error.problem.type === NAME_TAKEN_CODE) {
            form.setError('name', { type: 'server', message: t('classes.form.errors.nameTaken') });
            form.setFocus('name');
            return;
        }
        toast.show({ tone: 'critical', title: t('classes.toasts.saveFailed'), detail: portfolioErrorMessage(tp, error) });
    };
}

export function useClassFormActions({ mode, initial, form, onClose }: ClassFormActionsParams): ClassFormActions {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const toast: ToastApi = useToast();
    const fail: (error: Error) => void = useFailureReporter(form);
    const create: UseMutationResult<AssetClassView, ApiError, CreateClassInput> = useCreateClass();
    const update: UseMutationResult<AssetClassView, ApiError, UpdateClassInput> = useUpdateClass();

    const run = async (action: () => Promise<unknown>, title: string): Promise<void> => {
        try {
            await action();
            toast.show({ tone: 'positive', title });
            onClose();
        } catch (error) {
            fail(error as Error);
        }
    };

    const save = async (input: ClassFormInput): Promise<void> => {
        if (mode.kind === 'create') {
            await run(
                () => create.mutateAsync({ name: input.name, colorKey: input.colorKey }),
                t('classes.toasts.created', { name: input.name })
            );
            return;
        }
        const body: UpdateClassBody = classChanges(input, initial);
        if (Object.keys(body).length === 0) {
            onClose();
            return;
        }
        const key: 'classes.toasts.renamed' | 'classes.toasts.updated' =
            body.name === undefined ? 'classes.toasts.updated' : 'classes.toasts.renamed';
        await run(() => update.mutateAsync({ id: mode.assetClass.id, body }), t(key, { name: input.name }));
    };

    const restoreName = async (): Promise<void> => {
        if (mode.kind === 'edit') {
            await run(() => update.mutateAsync({ id: mode.assetClass.id, body: { name: null } }), t('classes.toasts.restored'));
        }
    };

    return { save, restoreName, busy: create.isPending || update.isPending };
}
