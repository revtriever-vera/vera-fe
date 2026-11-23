import { useMemo, useState, type BaseSyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseMutationResult } from '@tanstack/react-query';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useSaveIntegration } from '../api/use-save-integration.mutation';
import { createIntegrationSchema } from '../schemas/integration.schemas';
import type { IntegrationFormValues, IntegrationItem, IntegrationKind, SaveIntegrationVariables } from '../types';
import { integrationErrorMessage, testFailureReason } from './integration-error-message';
import { initialFormValues } from './integration-fields';
import { toSaveVariables } from './to-save-variables';

export interface IntegrationForm {
    readonly form: UseFormReturn<IntegrationFormValues>;
    readonly busy: boolean;
    readonly failure: string | null;
    readonly submit: (event?: BaseSyntheticEvent) => Promise<void>;
}

export function useIntegrationForm(kind: IntegrationKind, item: IntegrationItem | undefined, onSaved: () => void): IntegrationForm {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const toast: ToastApi = useToast();
    const save: UseMutationResult<IntegrationItem, Error, SaveIntegrationVariables> = useSaveIntegration();
    const [failure, setFailure] = useState<string | null>(null);
    const schema: ReturnType<typeof createIntegrationSchema> = useMemo(
        (): ReturnType<typeof createIntegrationSchema> => createIntegrationSchema(t, kind),
        [t, kind]
    );
    const form: UseFormReturn<IntegrationFormValues> = useForm<IntegrationFormValues>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: initialFormValues(kind, item)
    });

    const submit: IntegrationForm['submit'] = form.handleSubmit(async (values: IntegrationFormValues): Promise<void> => {
        setFailure(null);
        try {
            await save.mutateAsync(toSaveVariables(kind, values));
        } catch (error: unknown) {
            const reason: string | null = testFailureReason(error as Error);
            if (reason !== null) {
                track('integration_test_failed', { kind, reason });
            }
            setFailure(integrationErrorMessage(t, error as Error, kind));
            return;
        } finally {
            save.reset();
        }
        track('integration_saved', { kind });
        toast.show({ tone: 'positive', title: t('toasts.saved', { name: t(`kinds.${kind}.title`) }) });
        onSaved();
    });

    return { form, busy: form.formState.isSubmitting || save.isPending, failure, submit };
}
