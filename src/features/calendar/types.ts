import type { paths } from '@/shared/lib/api/schema';

export type ConnectionView = paths['/calendar/connection']['get']['responses']['200']['content']['application/json'];
export type ConnectionStatus = ConnectionView['status'];
export type EventsView = paths['/calendar/events']['get']['responses']['200']['content']['application/json'];
export type EventItem = EventsView['items'][number];
export type StartView = paths['/calendar/google/start']['get']['responses']['200']['content']['application/json'];

export const CONNECTION_STATUS = {
    none: 'none',
    active: 'active',
    revoked: 'revoked'
} as const satisfies Record<ConnectionStatus, ConnectionStatus>;

export const CALENDAR_ERROR = {
    consentDenied: 'calendar.consent_denied',
    scopeMissing: 'calendar.scope_missing',
    stateInvalid: 'calendar.state_invalid',
    providerUnavailable: 'calendar.provider_unavailable',
    providerDisabled: 'calendar.provider_disabled'
} as const;

export interface CalendarReturn {
    readonly connected: boolean;
    readonly error: string | undefined;
}
