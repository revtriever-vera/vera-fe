import { describe, expect, it } from 'vitest';
import type { SignupLinkFormValues } from '../schemas/signup-link.schema';
import type { CreateSignupLinkInput, SignupLink } from '../types';
import { signupLink } from '../../../../test/fixtures/admin';
import { EMPTY_SIGNUP_LINK_FORM, toCreateInput, toFormValues, toUpdateInput } from './signup-link-input';

const NOW: Date = new Date(2026, 10, 23, 10, 0, 0);

describe('toCreateInput', () => {
    it('sends no trial days, limit or expiry when the form leaves them out', () => {
        expect(toCreateInput({ ...EMPTY_SIGNUP_LINK_FORM, label: ' Parceiros ' }, NOW)).toEqual({
            label: 'Parceiros',
            trial: { kind: 'none', days: null },
            rules: [],
            maxUses: null,
            expiresAt: null,
            offerValidityDays: 30
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
                offerValidityDays: '45',
                rules: [{ percent: '30', fromCycle: '1', toCycle: '3' }]
            },
            NOW
        );
        expect(input.trial).toEqual({ kind: 'no_card', days: 14 });
        expect(input.maxUses).toBe(50);
        expect(input.offerValidityDays).toBe(45);
        expect(input.rules).toEqual([{ percent: 30, fromCycle: 1, toCycle: 3 }]);
        expect(input.expiresAt).toBe(new Date(2026, 11, 1, 23, 59, 59).toISOString());
    });
});

describe('editing a link', () => {
    it('fills the form from the link and keeps the stored expiry while the day does not change', () => {
        const link: SignupLink = signupLink({ expiresAt: '2026-12-31T23:59:59.000Z' });
        const values: SignupLinkFormValues = toFormValues(link);

        expect(values).toMatchObject({ label: 'Parceiros', trialKind: 'card', days: '14', maxUses: '100', offerValidityDays: '30' });
        expect(values.rules).toEqual([{ percent: '50', fromCycle: '1', toCycle: '3' }]);
        expect(toUpdateInput(values, link, NOW).expiresAt).toBe('2026-12-31T23:59:59.000Z');
        expect(toUpdateInput({ ...values, expiresAt: '2027-01-15' }, link, NOW).expiresAt).toBe(
            new Date(2027, 0, 15, 23, 59, 59).toISOString()
        );
    });

    it('maps a link without trial, limit or expiry to empty fields', () => {
        const values: SignupLinkFormValues = toFormValues(
            signupLink({ trial: { kind: 'none', days: null }, maxUses: null, expiresAt: null })
        );

        expect(values).toMatchObject({ trialKind: 'none', days: '', maxUses: '', expiresAt: null });
    });
});
