import { describe, expect, it } from 'vitest';
import { filenameFromDisposition } from './filename-from-disposition';

describe('filenameFromDisposition', () => {
    it('lê o nome entre aspas', () => {
        expect(filenameFromDisposition('attachment; filename="vera-carteira-2026-10-11.xlsx"', 'x.xlsx')).toBe(
            'vera-carteira-2026-10-11.xlsx'
        );
    });

    it('lê o nome sem aspas', () => {
        expect(filenameFromDisposition('attachment; filename=a.csv; size=3', 'x.csv')).toBe('a.csv');
    });

    it('usa o fallback sem cabeçalho, sem nome ou com nome inseguro', () => {
        expect(filenameFromDisposition(null, 'x.csv')).toBe('x.csv');
        expect(filenameFromDisposition('attachment', 'x.csv')).toBe('x.csv');
        expect(filenameFromDisposition('attachment; filename="../etc/passwd"', 'x.csv')).toBe('x.csv');
        expect(filenameFromDisposition('attachment; filename=".hidden"', 'x.csv')).toBe('x.csv');
    });
});
