import type { InvestmentPreview } from '../types';

export function readInvestmentPreview(value: Readonly<Record<string, unknown>>): InvestmentPreview | null {
    const valid: boolean =
        typeof value['previewId'] === 'string' &&
        Array.isArray(value['operations']) &&
        Array.isArray(value['effect']) &&
        Array.isArray(value['fixedIncome']) &&
        Array.isArray(value['notes']);
    return valid ? (value as InvestmentPreview) : null;
}
