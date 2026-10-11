import type { z } from 'zod';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';

const NON_TERM_FIELDS: ReadonlySet<string> = new Set<string>(['name', 'classId']);

export function termsAreValid(schema: z.ZodType<FixedIncomeFormInput>, input: FixedIncomeFormInput): boolean {
    const result: z.SafeParseReturnType<FixedIncomeFormInput, FixedIncomeFormInput> = schema.safeParse(input);
    return result.success || result.error.issues.every((issue: z.ZodIssue): boolean => NON_TERM_FIELDS.has(String(issue.path[0])));
}
