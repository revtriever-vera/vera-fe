import type { TFunction } from 'i18next';
import { z, type ZodEffects, type ZodEnum, type ZodString } from 'zod';
import { CLASS_NAME_MAX_LENGTH, normalizeClassName } from '../lib/class-name-rules';
import { CLASS_COLOR_KEYS, type ClassColorKey } from '../../types';

type ClassColorKeyTuple = [ClassColorKey, ...ClassColorKey[]];

const COLOR_KEYS: ClassColorKeyTuple = [...CLASS_COLOR_KEYS];

export function createClassSchema(
    t: TFunction<'portfolioTargets'>,
    takenNames: readonly string[]
): z.ZodObject<{ name: ZodEffects<ZodString>; colorKey: ZodEnum<ClassColorKeyTuple> }> {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, t('classes.form.errors.nameRequired'))
            .max(CLASS_NAME_MAX_LENGTH, t('classes.form.errors.nameTooLong'))
            .refine((value: string): boolean => !takenNames.includes(normalizeClassName(value)), t('classes.form.errors.nameTaken')),
        colorKey: z.enum(COLOR_KEYS)
    });
}

export type ClassFormInput = z.infer<ReturnType<typeof createClassSchema>>;
