import type { TFunction } from 'i18next';
import { z, type ZodEnum, type ZodObject, type ZodString } from 'zod';

const MAX_EMAIL_LENGTH: number = 254;

export function createInviteSchema(t: TFunction<'members'>): ZodObject<{ email: ZodString; role: ZodEnum<['owner', 'editor', 'viewer']> }> {
    return z.object({
        email: z.string().trim().min(1, t('inviteEmailRequired')).max(MAX_EMAIL_LENGTH).email(t('inviteEmailInvalid')),
        role: z.enum(['owner', 'editor', 'viewer'])
    });
}

export type InviteInput = z.infer<ReturnType<typeof createInviteSchema>>;
