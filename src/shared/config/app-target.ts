export const APP_TARGET = {
    unified: 'unified',
    tenant: 'tenant',
    admin: 'admin'
} as const;

export type AppTarget = (typeof APP_TARGET)[keyof typeof APP_TARGET];
