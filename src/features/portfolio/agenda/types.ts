import type { paths } from '@/shared/lib/api/schema';

export type AgendaResponse = paths['/portfolio-watch/agenda']['get']['responses']['200']['content']['application/json'];
export type AgendaItem = AgendaResponse['items'][number];
export type AgendaKind = AgendaItem['kind'];

export const AGENDA_FILTERS = ['income', 'assembly', 'maturity'] as const;

export type AgendaFilter = (typeof AGENDA_FILTERS)[number];

export const AGENDA_WINDOW_DAYS: number = 30;
