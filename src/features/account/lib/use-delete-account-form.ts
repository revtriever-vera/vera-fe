import type { BaseSyntheticEvent } from 'react';
import { useMemo } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { ApiError } from '@/shared/lib/api/api-error';
import { useDeleteAccount } from '../api/use-delete-account.mutation';
import { createDeleteAccountSchema, type DeleteAccountInput } from '../schemas/delete-account.schema';
import { accountErrorMessage } from './account-error-message';
import { emailsMatch } from './emails-match';

const MISMATCH_CODE: string = 'identity.confirmation_mismatch';

export interface DeleteAccountForm {
    readonly form: UseFormReturn<DeleteAccountInput>;
    readonly matches: boolean;
    readonly busy: boolean;
    readonly failure: Error | null;
    readonly submit: (event?: BaseSyntheticEvent) => Promise<void>;
}

export function useDeleteAccountForm(t: TFunction<'account'>, email: string, onDeleted: () => void): DeleteAccountForm {
    const erase: UseMutationResult<void, Error, string> = useDeleteAccount();
    const schema: ReturnType<typeof createDeleteAccountSchema> = useMemo(
        (): ReturnType<typeof createDeleteAccountSchema> => createDeleteAccountSchema(t, email),
        [t, email]
    );
    const form: UseFormReturn<DeleteAccountInput> = useForm<DeleteAccountInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: { confirmEmail: '' }
    });
    const typed: string = useWatch({ control: form.control, name: 'confirmEmail' });
    const isMismatch: boolean = erase.error instanceof ApiError && erase.error.problem.type === MISMATCH_CODE;

    const submit: DeleteAccountForm['submit'] = form.handleSubmit(async (input: DeleteAccountInput): Promise<void> => {
        try {
            await erase.mutateAsync(input.confirmEmail);
        } catch (error: unknown) {
            if (error instanceof ApiError && error.problem.type === MISMATCH_CODE) {
                form.setError('confirmEmail', { message: accountErrorMessage(t, error, 'delete') });
                form.setFocus('confirmEmail');
            }
            return;
        }
        onDeleted();
    });

    return {
        form,
        matches: emailsMatch(typed, email),
        busy: form.formState.isSubmitting || erase.isPending,
        failure: isMismatch ? null : erase.error,
        submit
    };
}
