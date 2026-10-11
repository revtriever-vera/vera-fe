import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import type { CreateTitleBody, FixedIncomePreviewBody } from '../types';
import { parseRateBps } from './rate-input';

export function toPreviewBody(input: FixedIncomeFormInput): FixedIncomePreviewBody | null {
    const rateBps: number | null = parseRateBps(input.rate);
    if (rateBps === null || input.applied === null || input.appliedAt === null || input.maturityDate === null) {
        return null;
    }
    return {
        kind: input.kind,
        indexer: input.indexer,
        rateBps,
        currency: input.currency,
        appliedMinor: input.applied,
        appliedAt: input.appliedAt,
        maturityDate: input.maturityDate
    };
}

export function toTitleBody(input: FixedIncomeFormInput): CreateTitleBody | null {
    const preview: FixedIncomePreviewBody | null = toPreviewBody(input);
    return preview === null ? null : { ...preview, name: input.name.trim(), classId: input.classId };
}
