import type { CreateSignupLinkInput } from '../types';
import type { SignupLinkFormValues } from '../schemas/signup-link.schema';
import { expiryInstant } from './signup-link-dates';
import { TRIAL_KIND } from './signup-link-offer';

export const EMPTY_SIGNUP_LINK_FORM: SignupLinkFormValues = {
    label: '',
    trialKind: TRIAL_KIND.none,
    days: '',
    maxUses: '',
    expiresAt: null,
    rules: []
};

export function toCreateInput(values: SignupLinkFormValues, now: Date = new Date()): CreateSignupLinkInput {
    const hasTrial: boolean = values.trialKind !== TRIAL_KIND.none;
    return {
        label: values.label.trim(),
        trial: { kind: values.trialKind, days: hasTrial ? Number(values.days) : null },
        rules: values.rules.map((rule) => ({
            percent: Number(rule.percent),
            fromCycle: Number(rule.fromCycle),
            toCycle: Number(rule.toCycle)
        })),
        maxUses: values.maxUses.trim() === '' ? null : Number(values.maxUses),
        expiresAt: values.expiresAt === null ? null : expiryInstant(values.expiresAt, values.trialKind === TRIAL_KIND.noCard, now)
    };
}
