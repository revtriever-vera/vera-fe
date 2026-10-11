import type { TFunction } from 'i18next';
import { z } from 'zod';
import type { ImportTarget } from '../lib/build-import-form-data';
import type { AccountKind, AccountView } from '../../types';

export const NEW_ACCOUNT_KINDS = ['checking', 'savings', 'credit_card', 'other'] as const satisfies readonly AccountKind[];
export const TARGET_MODES = ['existing', 'new'] as const;

export type TargetMode = (typeof TARGET_MODES)[number];

const NAME_MAX_LENGTH: number = 60;
const INSTITUTION_MAX_LENGTH: number = 60;

export interface AccountTargetFormValues {
    mode: TargetMode;
    accountId: string;
    newAccountName: string;
    newAccountKind: (typeof NEW_ACCOUNT_KINDS)[number];
    newAccountInstitution: string;
}

export function createAccountTargetSchema(t: TFunction<'spendingImports'>): z.ZodType<AccountTargetFormValues> {
    return z
        .object({
            mode: z.enum(TARGET_MODES),
            accountId: z.string(),
            newAccountName: z.string().trim().max(NAME_MAX_LENGTH, t('target.errors.nameTooLong')),
            newAccountKind: z.enum(NEW_ACCOUNT_KINDS),
            newAccountInstitution: z.string().trim().max(INSTITUTION_MAX_LENGTH, t('target.errors.institutionTooLong'))
        })
        .superRefine((values: AccountTargetFormValues, context: z.RefinementCtx): void => {
            if (values.mode === 'existing' && values.accountId === '') {
                context.addIssue({ code: z.ZodIssueCode.custom, path: ['accountId'], message: t('target.errors.accountRequired') });
            }
            if (values.mode === 'new' && values.newAccountName === '') {
                context.addIssue({ code: z.ZodIssueCode.custom, path: ['newAccountName'], message: t('target.errors.nameRequired') });
            }
        });
}

export function defaultTargetValues(
    accounts: readonly AccountView[],
    suggestedAccountId: string | null,
    institution: string | null
): AccountTargetFormValues {
    const suggested: boolean = accounts.some((account: AccountView): boolean => account.id === suggestedAccountId);
    return {
        mode: accounts.length === 0 ? 'new' : 'existing',
        accountId: suggested && suggestedAccountId !== null ? suggestedAccountId : '',
        newAccountName: institution ?? '',
        newAccountKind: 'checking',
        newAccountInstitution: ''
    };
}

export function toImportTarget(values: AccountTargetFormValues): ImportTarget {
    if (values.mode === 'existing') {
        return { accountId: values.accountId };
    }
    return {
        newAccountName: values.newAccountName,
        newAccountKind: values.newAccountKind,
        newAccountInstitution: values.newAccountInstitution === '' ? undefined : values.newAccountInstitution
    };
}
