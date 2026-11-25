import { z } from 'zod';
import { FIXED_INCOME_INDEXERS, FIXED_INCOME_KINDS, type CreateTitleBody } from '../../assets/types';

export const TITLE_STATUS = { inferred: 'inferred', check: 'check', needsInput: 'needs_input', duplicate: 'duplicate' } as const;

const issuerSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    groupId: z.string().min(1),
    groupName: z.string().min(1),
    kind: z.enum(['bank', 'company', 'sovereign', 'other']),
    fgcAssociated: z.boolean()
});

export const importedTitleSchema = z.object({
    lineId: z.string(),
    product: z.string(),
    issuer: issuerSchema.nullable(),
    issuerName: z.string().nullable(),
    kind: z.enum(FIXED_INCOME_KINDS).nullable(),
    indexer: z.enum(FIXED_INCOME_INDEXERS).nullable(),
    rateBps: z.number().nullable(),
    appliedMinor: z.number().nullable(),
    appliedAt: z.string().nullable(),
    maturityDate: z.string().nullable(),
    status: z.enum([TITLE_STATUS.inferred, TITLE_STATUS.check, TITLE_STATUS.needsInput, TITLE_STATUS.duplicate]),
    reason: z.string().nullable(),
    suggestion: z.string().optional()
});

export type ImportedTitle = z.infer<typeof importedTitleSchema>;
export type TitleStatus = ImportedTitle['status'];

export type TitleDecision =
    | { readonly lineId: string; readonly confirm: true }
    | { readonly lineId: string; readonly edits: CreateTitleBody }
    | { readonly lineId: string; readonly skip: true };

export function readImportedTitles(raw: readonly unknown[]): ImportedTitle[] {
    return raw.flatMap((item: unknown): ImportedTitle[] => {
        const parsed: z.SafeParseReturnType<unknown, ImportedTitle> = importedTitleSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
    });
}
