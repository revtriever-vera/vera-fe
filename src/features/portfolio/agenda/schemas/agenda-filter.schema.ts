import { z } from 'zod';
import { AGENDA_FILTERS } from '../types';

export const agendaFilterSchema = z.enum(AGENDA_FILTERS).optional().catch(undefined);
