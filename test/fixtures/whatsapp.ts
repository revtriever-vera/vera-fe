import type { IssuedCode, LinkView, ReminderItem, RemindersView } from '@/features/whatsapp/types';

export const VERA_NUMBER: string = '551140000000';
export const LINKED_PHONE: string = '+5511999990001';
export const WA_LINK: string = `https://wa.me/${VERA_NUMBER}?text=VINCULAR%20K7M2QX9D`;

export function linkView(overrides: Partial<LinkView> = {}): LinkView {
    return {
        status: 'none',
        phone: null,
        linkedAt: null,
        veraNumber: VERA_NUMBER,
        pending: null,
        lastUnlinkReason: null,
        consentRequired: false,
        ...overrides
    };
}

export function activeLink(overrides: Partial<LinkView> = {}): LinkView {
    return linkView({ status: 'active', phone: LINKED_PHONE, linkedAt: '2026-11-20T12:00:00.000Z', ...overrides });
}

export function pendingLink(expiresAt: string, overrides: Partial<LinkView> = {}): LinkView {
    return linkView({ status: 'pending', pending: { expiresAt }, ...overrides });
}

export function issuedCode(overrides: Partial<IssuedCode> = {}): IssuedCode {
    return { code: 'K7M2QX9D', waLink: WA_LINK, expiresAt: '2099-11-22T12:10:00.000Z', ...overrides };
}

export function reminderItem(overrides: Partial<ReminderItem> = {}): ReminderItem {
    return {
        id: 'rem-1',
        text: 'Aportar',
        kind: 'monthly',
        nextAt: '2026-12-05T12:00:00.000Z',
        dayOfMonth: 5,
        time: '09:00',
        createdVia: 'whatsapp',
        ...overrides
    };
}

export function remindersView(items: readonly ReminderItem[] = []): RemindersView {
    return { items: [...items] };
}
