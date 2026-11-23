import { z } from 'zod';

export const calendarSearchSchema = z.object({
    connected: z
        .union([z.literal(1), z.literal('1')])
        .optional()
        .catch(undefined),
    error: z.string().max(100).optional().catch(undefined)
});

export type CalendarSearch = z.infer<typeof calendarSearchSchema>;
