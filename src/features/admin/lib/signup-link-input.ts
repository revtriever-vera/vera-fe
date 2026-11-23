import type { CreateSignupLinkInput, SignupLink, UpdateSignupLinkInput } from '../types';
import type { SignupLinkFormValues } from '../schemas/signup-link.schema';
import { expiryInstant, localIso } from './signup-link-dates';
import { DEFAULT_OFFER_VALIDITY_DAYS, TRIAL_KIND } from './signup-link-offer';

export const EMPTY_SIGNUP_LINK_FORM: SignupLinkFormValues = {
    label: '',
    trialKind: TRIAL_KIND.none,
    days: '',
    maxUses: '',
    expiresAt: null,
    offerValidityDays: String(DEFAULT_OFFER_VALIDITY_DAYS),
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
        expiresAt: values.expiresAt === null ? null : expiryInstant(values.expiresAt, values.trialKind === TRIAL_KIND.noCard, now),
        offerValidityDays: Number(values.offerValidityDays)
    };
}

export function toFormValues(link: SignupLink): SignupLinkFormValues {
    return {
        label: link.label,
        trialKind: link.trial.kind,
        days: link.trial.days === null ? '' : String(link.trial.days),
        maxUses: link.maxUses === null ? '' : String(link.maxUses),
        expiresAt: link.expiresAt === null ? null : localIso(new Date(link.expiresAt)),
        offerValidityDays: String(link.offerValidityDays),
        rules: link.rules.map((rule) => ({
            percent: String(rule.percent),
            fromCycle: String(rule.fromCycle),
            toCycle: String(rule.toCycle)
        }))
    };
}

/** Mantém o instante já gravado quando o dia da validade não mudou: o fim do dia recalculado seria um vencimento novo para a API. */
export function toUpdateInput(values: SignupLinkFormValues, link: SignupLink, now: Date = new Date()): UpdateSignupLinkInput {
    const input: CreateSignupLinkInput = toCreateInput(values, now);
    const unchanged: boolean =
        values.expiresAt !== null && link.expiresAt !== null && values.expiresAt === localIso(new Date(link.expiresAt));
    return unchanged ? { ...input, expiresAt: link.expiresAt } : input;
}
