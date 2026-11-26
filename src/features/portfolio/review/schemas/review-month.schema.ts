import { z } from 'zod';
import { MONTH_PATTERN } from '../types';

export const reviewMonthSchema = z.string().regex(MONTH_PATTERN).optional().catch(undefined);
