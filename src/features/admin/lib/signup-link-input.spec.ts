import { describe, expect, it } from 'vitest';
import type { CreateSignupLinkInput } from '../types';
import { EMPTY_SIGNUP_LINK_FORM, toCreateInput } from './signup-link-input';

const NOW: Date = new Date(2026, 10, 23, 10, 0, 0);

describe('toCreateInput', () => {
    it('sends no trial days, limit or expiry when the form leaves them out', () => {
        expect(toCreateInput({ ...EMPTY_SIGNUP_LINK_FORM, label: ' Parceiros ' }, NOW)).toEqual({
            label: 'Parceiros',
            trial: { kind: 'none', days: null },
            rules: [],
            maxUses: null,
            expiresAt: null
        });
    });

    it('turns the typed numbers into the offer', () => {
        const input: CreateSignupLinkInput = toCreateInput(
            {
                label: 'Feira',
                trialKind: 'no_card',
                days: '14',
                maxUses: '50',
                expiresAt: '2026-12-01',
                rules: [{ percent: '30', fromCycle: '1', toCycle: '3' }]
            },
            NOW
        );
        expect(input.trial).toEqual({ kind: 'no_card', days: 14 });
        expect(input.maxUses).toBe(50);
        expect(input.rules).toEqual([{ percent: 30, fromCycle: 1, toCycle: 3 }]);
        expect(input.expiresAt).toBe(new Date(2026, 11, 1, 23, 59, 59).toISOString());
    });
});
