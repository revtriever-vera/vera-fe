import type { CatalogGroup } from '../types';

const CNPJ_LENGTH: number = 14;
const CNPJ_TERM: RegExp = /^[\d.\-/\s]+$/;
const NON_DIGITS: RegExp = /\D/g;
const CNPJ_MASK: RegExp = /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/;
const CVM_MARKET: string = 'CVM';

export function catalogSearchTerm(group: CatalogGroup, term: string): string {
    if (group !== 'fundos' || !CNPJ_TERM.test(term) || !/\d/.test(term)) {
        return term;
    }
    return term.replace(NON_DIGITS, '');
}

export function formatCnpj(symbol: string): string {
    if (symbol.length !== CNPJ_LENGTH) {
        return symbol;
    }
    return symbol.replace(CNPJ_MASK, '$1.$2.$3/$4-$5');
}

export function isCvmMarket(market: string | null): boolean {
    return market === CVM_MARKET;
}
