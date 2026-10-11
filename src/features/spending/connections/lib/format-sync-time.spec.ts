import { describe, expect, it } from 'vitest';
import { consentExpiresSoon, shortDate, syncStamp, verifiedStamp, type SyncStamp } from './format-sync-time';

const NOW: Date = new Date('2026-10-11T15:00:00.000Z');

describe('syncStamp', () => {
    it('mostra só a hora quando é hoje', () => {
        const stamp: SyncStamp = syncStamp('2026-10-11T14:10:00.000Z', NOW, 'pt-BR');

        expect(stamp.kind).toBe('today');
    });

    it('mostra data e hora quando foi em outro dia', () => {
        const stamp: SyncStamp = syncStamp('2026-10-01T14:10:00.000Z', NOW, 'en');

        expect(stamp.kind).toBe('date');
        expect(stamp).toMatchObject({ date: expect.stringContaining('10') as string });
    });
});

describe('datas curtas', () => {
    it('formata dd/mm e a verificação por Intl', () => {
        expect(shortDate('2026-12-24T12:00:00.000Z', 'pt-BR')).toBe('24/12');
        expect(verifiedStamp('2026-10-11T15:00:00.000Z', 'pt-BR')).toContain('11/10/2026');
    });
});

describe('consentExpiresSoon', () => {
    it('avisa a menos de 30 dias e não avisa depois nem sem data', () => {
        expect(consentExpiresSoon('2026-11-01T00:00:00.000Z', NOW)).toBe(true);
        expect(consentExpiresSoon('2027-03-01T00:00:00.000Z', NOW)).toBe(false);
        expect(consentExpiresSoon(null, NOW)).toBe(false);
    });
});
