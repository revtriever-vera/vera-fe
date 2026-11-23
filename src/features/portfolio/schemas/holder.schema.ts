import { z } from 'zod';
import { HOLDER_ALL } from '../lib/holder-filter';

export const holderSearchSchema = z
    .union([z.literal(HOLDER_ALL), z.string().uuid()])
    .optional()
    .catch(undefined);
