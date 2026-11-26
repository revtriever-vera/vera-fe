import { useSearch } from '@tanstack/react-router';
import { agendaFilterSchema } from '../schemas/agenda-filter.schema';
import type { AgendaFilter } from '../types';

export function useAgendaFilter(): AgendaFilter | undefined {
    return useSearch({
        strict: false,
        select: (search: Record<string, unknown>): AgendaFilter | undefined => agendaFilterSchema.parse(search.kind)
    });
}
