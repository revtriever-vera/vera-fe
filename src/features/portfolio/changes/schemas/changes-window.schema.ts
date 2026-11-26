import { z } from 'zod';
import { CHANGES_WINDOWS } from '../types';

export const changesWindowSchema = z.enum(CHANGES_WINDOWS).optional().catch(undefined);
