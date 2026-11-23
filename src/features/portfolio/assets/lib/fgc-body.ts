import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import type { FgcSimulationBody } from '../types';

export function toFgcBody(input: FixedIncomeFormInput, excludeTitleId: string | undefined): FgcSimulationBody | null {
    if (input.issuer === null || input.applied === null || input.applied <= 0 || input.currency !== 'BRL') {
        return null;
    }
    const base: FgcSimulationBody = { issuerId: input.issuer.id, kind: input.kind, valueMinor: input.applied };
    return excludeTitleId === undefined ? base : { ...base, excludeTitleId };
}
