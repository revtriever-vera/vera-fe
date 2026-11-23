import { useMemo, type BaseSyntheticEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useInvite, type InviteInput as InviteBody } from '../api/use-invite.mutation';
import { createInviteSchema, type InviteInput } from '../schemas/invite.schema';
import type { InviteResult } from '../types';
import { useMemberFailure } from './use-member-failure';

export interface InviteForm {
    readonly form: UseFormReturn<InviteInput>;
    readonly busy: boolean;
    readonly submit: (event?: BaseSyntheticEvent) => Promise<void>;
}

export function useInviteForm(): InviteForm {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const toast = useToast();
    const fail: (error: Error) => void = useMemberFailure();
    const invite: UseMutationResult<InviteResult, Error, InviteBody> = useInvite();
    const schema = useMemo((): ReturnType<typeof createInviteSchema> => createInviteSchema(t), [t]);
    const form: UseFormReturn<InviteInput> = useForm<InviteInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: { email: '', role: 'editor' }
    });

    const submit: InviteForm['submit'] = form.handleSubmit(async (input: InviteInput): Promise<void> => {
        try {
            await invite.mutateAsync(input);
            track('member_invited', { role: input.role });
            toast.show({ tone: 'positive', title: t('inviteSent', { email: input.email }) });
            form.reset({ email: '', role: input.role });
        } catch (error: unknown) {
            fail(error instanceof Error ? error : new Error('unknown'));
            form.setFocus('email');
        }
    });

    return { form, busy: form.formState.isSubmitting || invite.isPending, submit };
}
