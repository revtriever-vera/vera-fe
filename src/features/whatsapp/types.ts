import type { paths } from '@/shared/lib/api/schema';

export type LinkView = paths['/whatsapp/link']['get']['responses']['200']['content']['application/json'];
export type LinkStatus = LinkView['status'];
export type UnlinkReason = NonNullable<LinkView['lastUnlinkReason']>;
export type IssuedCode = paths['/whatsapp/link/code']['post']['responses']['200']['content']['application/json'];
export type IssueCodeBody = NonNullable<paths['/whatsapp/link/code']['post']['requestBody']>['content']['application/json'];
export type RemindersView = paths['/reminders']['get']['responses']['200']['content']['application/json'];
export type ReminderItem = RemindersView['items'][number];

export interface IssuedLink extends IssuedCode {
    readonly consentGiven: boolean;
}

export const LINK_STATUS = {
    none: 'none',
    pending: 'pending',
    active: 'active',
    suspended: 'suspended'
} as const satisfies Record<LinkStatus, LinkStatus>;

export const EXAMPLE_KEYS = ['delivery', 'portfolio', 'meeting', 'meetings', 'reminder'] as const;

export type ExampleKey = (typeof EXAMPLE_KEYS)[number];
