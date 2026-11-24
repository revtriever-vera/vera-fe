import { describe, expect, it } from 'vitest';
import { catalogSearchTerm, formatCnpj, isCvmMarket } from './cnpj';

describe('catalogSearchTerm', () => {
    it('envia só os dígitos quando o termo de fundos parece CNPJ', () => {
        expect(catalogSearchTerm('fundos', '00.000.000/0001-91')).toBe('00000000000191');
        expect(catalogSearchTerm('fundos', '00000000000191')).toBe('00000000000191');
        expect(catalogSearchTerm('fundos', '00.000')).toBe('00000');
    });

    it('mantém o texto do nome', () => {
        expect(catalogSearchTerm('fundos', 'verde 100')).toBe('verde 100');
        expect(catalogSearchTerm('fundos', '')).toBe('');
        expect(catalogSearchTerm('fundos', '. -')).toBe('. -');
    });

    it('não mexe nas outras buscas', () => {
        expect(catalogSearchTerm('acoes_br', '123.456')).toBe('123.456');
    });
});

describe('formatCnpj', () => {
    it('aplica a máscara em 14 dígitos', () => {
        expect(formatCnpj('00000000000191')).toBe('00.000.000/0001-91');
    });

    it('devolve o texto quando não é CNPJ', () => {
        expect(formatCnpj('ITUB4')).toBe('ITUB4');
    });
});

describe('isCvmMarket', () => {
    it('reconhece só o mercado CVM', () => {
        expect(isCvmMarket('CVM')).toBe(true);
        expect(isCvmMarket('B3')).toBe(false);
        expect(isCvmMarket(null)).toBe(false);
    });
});
