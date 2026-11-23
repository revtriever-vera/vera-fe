import { describe, expect, it } from 'vitest';
import { expiryInstant, noCardLastIso, todayIso } from './signup-link-dates';

const NOW: Date = new Date(2026, 10, 23, 10, 0, 0);

describe('signup link dates', () => {
    it('reads today and the last day of a no-card link in the local calendar', () => {
        expect(todayIso(NOW)).toBe('2026-11-23');
        expect(noCardLastIso(NOW)).toBe('2027-02-21');
    });

    it('expires a link at the end of the chosen day', () => {
        expect(expiryInstant('2026-12-01', false, NOW)).toBe(new Date(2026, 11, 1, 23, 59, 59).toISOString());
    });

    it('keeps a no-card link inside 90 days even on the last allowed day', () => {
        const instant: number = new Date(expiryInstant(noCardLastIso(NOW), true, NOW)).getTime();
        expect(instant).toBeLessThan(NOW.getTime() + 90 * 86_400_000);
    });
});
