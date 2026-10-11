import { z } from 'zod';

const schema = z.object({
    VITE_API_URL: z.string().url().default('http://localhost:3333'),
    VITE_POSTHOG_KEY: z.string().default(''),
    VITE_POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com')
});

export const env = schema.parse(import.meta.env);
