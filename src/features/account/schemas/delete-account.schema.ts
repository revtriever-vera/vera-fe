import type { TFunction } from 'i18next';
import { z, type ZodEffects, type ZodObject, type ZodString } from 'zod';
import { emailsMatch } from '../lib/emails-match';

export function createDeleteAccountSchema(
    t: TFunction<'account'>,
    expectedEmail: string
): ZodObject<{ confirmEmail: ZodEffects<ZodString, string, string> }> {
    return z.object({
        confirmEmail: z
            .string()
            .trim()
            .min(1, t('deleteConfirmRequired'))
            .refine((value: string): boolean => emailsMatch(value, expectedEmail), t('deleteConfirmMismatch'))
    });
}

export type DeleteAccountInput = z.infer<ReturnType<typeof createDeleteAccountSchema>>;
