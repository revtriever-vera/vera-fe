import type { TFunction } from 'i18next';
import { z, type ZodObject, type ZodString } from 'zod';

const AUTHENTICATOR_CODE: RegExp = /^\d{6}$/;
const RECOVERY_CODE_MIN_LENGTH: number = 6;
const RECOVERY_CODE_MAX_LENGTH: number = 32;

export function createAuthenticatorCodeSchema(t: TFunction<'admin'>): ZodObject<{ code: ZodString }> {
    return z.object({ code: z.string().trim().regex(AUTHENTICATOR_CODE, t('totpCodeInvalid')) });
}

export function createRecoveryCodeSchema(t: TFunction<'admin'>): ZodObject<{ code: ZodString }> {
    return z.object({
        code: z
            .string()
            .trim()
            .min(RECOVERY_CODE_MIN_LENGTH, t('totpRecoveryInvalid'))
            .max(RECOVERY_CODE_MAX_LENGTH, t('totpRecoveryInvalid'))
    });
}

export type TotpCodeInput = z.infer<ReturnType<typeof createAuthenticatorCodeSchema>>;
