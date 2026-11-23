import { useSearch } from '@tanstack/react-router';
import { holderSearchSchema } from '../schemas/holder.schema';
import type { HolderParam } from './holder-filter';

export function useHolderParam(): HolderParam {
    return useSearch({
        strict: false,
        select: (search: Record<string, unknown>): HolderParam => holderSearchSchema.parse(search.holder)
    });
}
