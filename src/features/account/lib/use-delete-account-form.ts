import type { BaseSyntheticEvent } from 'react';
import { useMemo } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { useDeleteAccount } from '../api/use-delete-account.mutation';
import { createDeleteAccountSchema, type DeleteAccountInput } from '../schemas/delete-account.schema';
import { confirmWordMatches } from './confirm-word';

export interface DeleteAccountForm {
    readonly form: UseFormReturn<DeleteAccountInput>;
    readonly matches: boolean;
    readonly busy: boolean;
    readonly failure: Error | null;
    readonly submit: (event?: BaseSyntheticEvent) => Promise<void>;
}

export function useDeleteAccountForm(t: TFunction<'account'>, email: string, onDeleted: () => void): DeleteAccountForm {
    const erase: UseMutationResult<void, Error, string> = useDeleteAccount();
    const word: string = t('deleteWord');
    const schema: ReturnType<typeof createDeleteAccountSchema> = useMemo(
        (): ReturnType<typeof createDeleteAccountSchema> => createDeleteAccountSchema(t, word),
        [t, word]
    );
    const form: UseFormReturn<DeleteAccountInput> = useForm<DeleteAccountInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: { confirmation: '' }
    });
    const typed: string = useWatch({ control: form.control, name: 'confirmation' });

    const submit: DeleteAccountForm['submit'] = form.handleSubmit(async (): Promise<void> => {
        try {
            await erase.mutateAsync(email);
        } catch {
            return;
        }
        onDeleted();
    });

    return {
        form,
        matches: confirmWordMatches(typed, word),
        busy: form.formState.isSubmitting || erase.isPending,
        failure: erase.error,
        submit
    };
}
