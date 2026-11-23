import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, type ReactElement } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { ZodObject, ZodString } from 'zod';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { createAuthenticatorCodeSchema, createRecoveryCodeSchema, type TotpCodeInput } from '../schemas/totp-code.schema';

export type TotpCodeKind = 'authenticator' | 'recovery';

export interface TotpCodeFormProps {
    readonly kind: TotpCodeKind;
    readonly submitLabel: string;
    readonly busyLabel: string;
    readonly pending: boolean;
    readonly onSubmit: (code: string) => void;
}

export function TotpCodeForm({ kind, submitLabel, busyLabel, pending, onSubmit }: TotpCodeFormProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const schema: ZodObject<{ code: ZodString }> = useMemo(
        (): ZodObject<{ code: ZodString }> => (kind === 'recovery' ? createRecoveryCodeSchema(t) : createAuthenticatorCodeSchema(t)),
        [kind, t]
    );
    const form: UseFormReturn<TotpCodeInput> = useForm<TotpCodeInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: { code: '' }
    });
    const isRecovery: boolean = kind === 'recovery';

    return (
        <form
            noValidate
            className="flex flex-col gap-3"
            onSubmit={(event): void => {
                void form.handleSubmit((input: TotpCodeInput): void => {
                    onSubmit(input.code);
                })(event);
            }}
        >
            <Field
                label={isRecovery ? t('totpRecoveryLabel') : t('totpCodeLabel')}
                hint={isRecovery ? t('totpRecoveryHint') : undefined}
                error={form.formState.errors.code?.message}
                inputMode={isRecovery ? 'text' : 'numeric'}
                autoComplete={isRecovery ? 'off' : 'one-time-code'}
                maxLength={isRecovery ? 32 : 6}
                {...form.register('code')}
            />
            <Button type="submit" block loading={pending}>
                {pending ? busyLabel : submitLabel}
            </Button>
        </form>
    );
}
