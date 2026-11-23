import type { ConnectionView, EventItem, EventsView } from '@/features/calendar/types';

export function connectionView(overrides: Partial<ConnectionView> = {}): ConnectionView {
    return { status: 'none', email: null, connectedAt: null, access: null, ...overrides };
}

export function activeConnection(overrides: Partial<ConnectionView> = {}): ConnectionView {
    return connectionView({
        status: 'active',
        email: 'ana@exemplo.com',
        connectedAt: '2026-11-22T12:00:00.000Z',
        access: 'read_write',
        ...overrides
    });
}

export function eventItem(overrides: Partial<EventItem> = {}): EventItem {
    return {
        id: 'evt1',
        title: 'Revisão da carteira com a Ana',
        start: '2026-11-24T13:00:00.000Z',
        end: '2026-11-24T14:00:00.000Z',
        allDay: false,
        byVera: true,
        ...overrides
    };
}

export function eventsView(items: EventItem[] = []): EventsView {
    return { items };
}

export const GOOGLE_URL: string = 'https://accounts.google.com/o/oauth2/v2/auth?state=opaque';
