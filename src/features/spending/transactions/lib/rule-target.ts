import type { TransactionView } from '../../types';

export interface RuleTarget {
    readonly scope: 'counterparty' | 'description';
    readonly label: string;
}

export type TargetSource = Pick<TransactionView, 'counterpartyName' | 'description'>;

const PREFIX_SEPARATOR: string = ' · ';

export function displayDescription(text: string): string {
    const parts: string[] = text.split(PREFIX_SEPARATOR);
    return (parts[parts.length - 1] ?? text).trim();
}

export function descriptionTargetOf(transaction: TargetSource, normalize: (text: string) => string): RuleTarget {
    return { scope: 'description', label: normalize(transaction.description) };
}

export function ruleTargetOf(transaction: TargetSource, normalize: (text: string) => string): RuleTarget {
    const name: string = transaction.counterpartyName?.trim() ?? '';
    if (name === '') {
        return descriptionTargetOf(transaction, normalize);
    }
    return { scope: 'counterparty', label: name };
}
