import { z } from 'zod';

const optionalUrl = z.union([z.literal(''), z.string().url()]).default('');

const schema = z.object({
    VITE_API_URL: z.string().url().default('http://localhost:3333'),
    VITE_POSTHOG_KEY: z.string().default(''),
    VITE_POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),
    VITE_GOOGLE_CLIENT_ID: z.string().default(''),
    VITE_FACEBOOK_APP_ID: z.string().default(''),
    VITE_TERMS_URL: optionalUrl,
    VITE_PRIVACY_URL: optionalUrl,
    VITE_LOGIN_PHOTO_URL: optionalUrl
});

export const env = schema.parse(import.meta.env);
