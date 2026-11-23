import { describe, expect, it } from 'vitest';
import { autoTitleName } from './auto-title-name';

describe('autoTitleName', () => {
    it('junta o tipo e o emissor', () => {
        expect(autoTitleName('CDB', 'Banco XP')).toBe('CDB Banco XP');
    });

    it('fica vazio sem emissor', () => {
        expect(autoTitleName('CDB', null)).toBe('');
    });
});
