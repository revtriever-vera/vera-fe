import type { TransactionView } from '../../types';

const SEPARATOR: string = ' · ';

function fold(text: string): string {
    return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function transactionTitle(transaction: Pick<TransactionView, 'description' | 'counterpartyName'>): string {
    const name: string = transaction.counterpartyName?.trim() ?? '';
    if (name === '' || fold(transaction.description).includes(fold(name))) {
        return transaction.description;
    }
    return `${transaction.description}${SEPARATOR}${name}`;
}
