import type { TFunction } from 'i18next';
import { z, type ZodEffects, type ZodObject, type ZodString } from 'zod';
import { confirmWordMatches } from '../lib/confirm-word';

export function createDeleteAccountSchema(
    t: TFunction<'account'>,
    word: string
): ZodObject<{ confirmation: ZodEffects<ZodString, string, string> }> {
    return z.object({
        confirmation: z
            .string()
            .trim()
            .min(1, t('deleteConfirmRequired', { word }))
            .refine((value: string): boolean => confirmWordMatches(value, word), t('deleteConfirmMismatch', { word }))
    });
}

export type DeleteAccountInput = z.infer<ReturnType<typeof createDeleteAccountSchema>>;
