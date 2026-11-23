import { useRef, type RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import type { FixedIncomeKind, TitleIssuer } from '../types';
import { autoTitleName } from './auto-title-name';
import { keepsIssuer } from './issuer-kind';

export type IssuerContext = 'create' | 'edit';

export interface IssuerHandlers {
    readonly changeKind: (kind: FixedIncomeKind) => void;
    readonly changeIssuer: (issuer: TitleIssuer | null) => void;
    readonly markNameTouched: () => void;
}

export function useIssuerHandlers(form: UseFormReturn<FixedIncomeFormInput>, context: IssuerContext): IssuerHandlers {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const touched: RefObject<boolean> = useRef<boolean>(context === 'edit');
    const rename = (kind: FixedIncomeKind, issuer: TitleIssuer | null): void => {
        if (!touched.current) {
            form.setValue('name', autoTitleName(t(`fixedIncome.kinds.${kind}`), issuer?.name ?? null), {
                shouldValidate: form.formState.isSubmitted
            });
        }
    };
    return {
        changeKind: (kind: FixedIncomeKind): void => {
            const current: TitleIssuer | null = form.getValues('issuer');
            const kept: TitleIssuer | null = keepsIssuer(kind, current) ? current : null;
            form.setValue('kind', kind, { shouldValidate: form.formState.isSubmitted });
            form.setValue('issuer', kept);
            rename(kind, kept);
        },
        changeIssuer: (issuer: TitleIssuer | null): void => {
            form.setValue('issuer', issuer, { shouldValidate: form.formState.isSubmitted });
            if (issuer !== null) {
                track('fixed_income_issuer_set', { context });
            }
            rename(form.getValues('kind'), issuer);
        },
        markNameTouched: (): void => {
            touched.current = true;
        }
    };
}
